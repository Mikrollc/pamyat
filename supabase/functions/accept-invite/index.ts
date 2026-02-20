import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the calling user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to bypass RLS for the atomic accept operation
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch invitation by token
    const { data: invitation, error: fetchError } = await adminClient
      .from('invitations')
      .select('id, grave_id, role, status, expires_at')
      .eq('token', token)
      .single();

    if (fetchError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invitation.status === 'revoked') {
      return new Response(JSON.stringify({ error: 'Invitation has been revoked' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invitation.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Invitation is no longer pending' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (new Date(invitation.expires_at) <= new Date()) {
      return new Response(JSON.stringify({ error: 'Invitation has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Check if user is already a member
    const { data: existingMember } = await adminClient
      .from('grave_members')
      .select('id, role')
      .eq('grave_id', invitation.grave_id)
      .eq('user_id', user.id)
      .single();

    const roleRank: Record<string, number> = { owner: 3, editor: 2, viewer: 1 };

    if (existingMember) {
      // Idempotent: already a member. Upgrade role if invite offers higher.
      const currentRank = roleRank[existingMember.role] ?? 0;
      const inviteRank = roleRank[invitation.role] ?? 0;

      if (inviteRank > currentRank) {
        const { error: upgradeError } = await adminClient
          .from('grave_members')
          .update({ role: invitation.role })
          .eq('id', existingMember.id);

        if (upgradeError) {
          console.error('Error upgrading member role:', upgradeError);
          return new Response(JSON.stringify({ error: 'Failed to upgrade role' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    } else {
      // 3. Insert grave_members row
      const { error: insertError } = await adminClient
        .from('grave_members')
        .insert({
          grave_id: invitation.grave_id,
          user_id: user.id,
          role: invitation.role,
        });

      if (insertError) {
        console.error('Error inserting grave member:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to add member' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. Mark invitation as accepted
    const { error: updateError } = await adminClient
      .from('invitations')
      .update({ status: 'accepted', accepted_by: user.id })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update invitation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
