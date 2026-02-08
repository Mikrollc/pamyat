export type GraveRole = 'owner' | 'editor' | 'viewer';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type InviteChannel = 'email' | 'sms';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          locale: 'ru' | 'en';
          push_orthodox: boolean;
          push_us_holidays: boolean;
          push_token: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      cemeteries: {
        Row: {
          id: string;
          name: string;
          name_ru: string | null;
          city: string | null;
          state: string | null;
          country: string;
          location: unknown;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cemeteries']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['cemeteries']['Row']>;
      };
      graves: {
        Row: {
          id: string;
          cemetery_id: string | null;
          location: unknown;
          person_name: string;
          person_name_ru: string | null;
          birth_date: string | null;
          death_date: string | null;
          inscription: string | null;
          slug: string;
          is_public: boolean;
          cover_photo_path: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['graves']['Row']> & {
          location: unknown;
          person_name: string;
          slug: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['graves']['Row']>;
      };
      grave_photos: {
        Row: {
          id: string;
          grave_id: string;
          storage_path: string;
          caption: string | null;
          sort_order: number;
          uploaded_by: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['grave_photos']['Row']> & {
          grave_id: string;
          storage_path: string;
          uploaded_by: string;
        };
        Update: Partial<Database['public']['Tables']['grave_photos']['Row']>;
      };
      grave_members: {
        Row: {
          id: string;
          grave_id: string;
          user_id: string | null;
          role: GraveRole;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['grave_members']['Row']> & { grave_id: string };
        Update: Partial<Database['public']['Tables']['grave_members']['Row']>;
      };
      invitations: {
        Row: {
          id: string;
          grave_id: string;
          invited_by: string;
          channel: InviteChannel;
          recipient: string;
          role: GraveRole;
          token: string;
          status: InviteStatus;
          accepted_by: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: Partial<Database['public']['Tables']['invitations']['Row']> & {
          grave_id: string;
          invited_by: string;
          channel: InviteChannel;
          recipient: string;
        };
        Update: Partial<Database['public']['Tables']['invitations']['Row']>;
      };
      maintenance_waitlist: {
        Row: {
          id: string;
          grave_id: string;
          user_id: string | null;
          email: string | null;
          phone: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['maintenance_waitlist']['Row']> & {
          grave_id: string;
        };
        Update: Partial<Database['public']['Tables']['maintenance_waitlist']['Row']>;
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          grave_id: string | null;
          push_orthodox: boolean;
          push_us_holidays: boolean;
          custom_dates: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notification_preferences']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['notification_preferences']['Row']>;
      };
    };
  };
}
