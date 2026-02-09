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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'cemeteries_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      graves: {
        Row: {
          id: string;
          cemetery_id: string | null;
          location: unknown;
          person_name: string;
          person_name_ru: string | null;
          birth_year: number | null;
          birth_month: number | null;
          birth_day: number | null;
          death_year: number | null;
          death_month: number | null;
          death_day: number | null;
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
        Relationships: [
          {
            foreignKeyName: 'graves_cemetery_id_fkey';
            columns: ['cemetery_id'];
            isOneToOne: false;
            referencedRelation: 'cemeteries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'graves_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'grave_photos_grave_id_fkey';
            columns: ['grave_id'];
            isOneToOne: false;
            referencedRelation: 'graves';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'grave_photos_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'grave_members_grave_id_fkey';
            columns: ['grave_id'];
            isOneToOne: false;
            referencedRelation: 'graves';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'grave_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'invitations_grave_id_fkey';
            columns: ['grave_id'];
            isOneToOne: false;
            referencedRelation: 'graves';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_accepted_by_fkey';
            columns: ['accepted_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'maintenance_waitlist_grave_id_fkey';
            columns: ['grave_id'];
            isOneToOne: false;
            referencedRelation: 'graves';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_waitlist_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notification_preferences_grave_id_fkey';
            columns: ['grave_id'];
            isOneToOne: false;
            referencedRelation: 'graves';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      nearby_cemeteries: {
        Args: { lat: number; lng: number; radius_m?: number };
        Returns: Database['public']['Tables']['cemeteries']['Row'][];
      };
      generate_grave_slug: {
        Args: { p_name: string; p_birth_year?: number | null; p_death_year?: number | null };
        Returns: string;
      };
      map_graves: {
        Args: Record<string, never>;
        Returns: { id: string; slug: string; person_name: string; lat: number; lng: number }[];
      };
      all_cemeteries: {
        Args: Record<string, never>;
        Returns: { id: string; name: string; name_ru: string | null; city: string | null; state: string | null; lat: number; lng: number }[];
      };
    };
    Enums: {
      grave_role: GraveRole;
      invite_status: InviteStatus;
      invite_channel: InviteChannel;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Grave = Database['public']['Tables']['graves']['Row'];
export type GraveInsert = Database['public']['Tables']['graves']['Insert'];
export type GraveUpdate = Database['public']['Tables']['graves']['Update'];
export type Cemetery = Database['public']['Tables']['cemeteries']['Row'];
export type GravePhoto = Database['public']['Tables']['grave_photos']['Row'];
export type GravePhotoInsert = Database['public']['Tables']['grave_photos']['Insert'];
export type WaitlistEntry = Database['public']['Tables']['maintenance_waitlist']['Row'];
export type WaitlistInsert = Database['public']['Tables']['maintenance_waitlist']['Insert'];
