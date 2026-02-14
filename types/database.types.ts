export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      booking_payments: {
        Row: {
          amount_cents: number
          booking_id: string
          created_at: string | null
          id: string
          organization_id: string
          payment_type: string
          platform_fee_cents: number
          refunded_amount_cents: number | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          booking_id: string
          created_at?: string | null
          id?: string
          organization_id: string
          payment_type: string
          platform_fee_cents: number
          refunded_amount_cents?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          organization_id?: string
          payment_type?: string
          platform_fee_cents?: number
          refunded_amount_cents?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_paid_cents: number | null
          amount_total_cents: number
          booking_date: string
          client_email: string
          client_name: string
          client_phone: string | null
          conditions_snapshot: Json | null
          created_at: string | null
          deposit_cents: number | null
          guide_id: string | null
          id: string
          notes: string | null
          organization_id: string
          party_size: number
          payment_status: string | null
          source: string | null
          status: string | null
          time_slot: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          amount_paid_cents?: number | null
          amount_total_cents: number
          booking_date: string
          client_email: string
          client_name: string
          client_phone?: string | null
          conditions_snapshot?: Json | null
          created_at?: string | null
          deposit_cents?: number | null
          guide_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          party_size?: number
          payment_status?: string | null
          source?: string | null
          status?: string | null
          time_slot: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          amount_paid_cents?: number | null
          amount_total_cents?: number
          booking_date?: string
          client_email?: string
          client_name?: string
          client_phone?: string | null
          conditions_snapshot?: Json | null
          created_at?: string | null
          deposit_cents?: number | null
          guide_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          party_size?: number
          payment_status?: string | null
          source?: string | null
          status?: string | null
          time_slot?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_availability: {
        Row: {
          booking_id: string | null
          created_at: string | null
          date: string
          guide_profile_id: string
          id: string
          organization_id: string
          status: string | null
          time_slot: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          date: string
          guide_profile_id: string
          id?: string
          organization_id: string
          status?: string | null
          time_slot: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          date?: string
          guide_profile_id?: string
          id?: string
          organization_id?: string
          status?: string | null
          time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_availability_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_availability_guide_profile_id_fkey"
            columns: ["guide_profile_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_availability_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          id: string
          organization_id: string
          photo_url: string | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          organization_id: string
          photo_url?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          organization_id?: string
          photo_url?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          cancellation_free_window_hours: number
          cancellation_late_refund_percent: number
          cancellation_policy_type: string
          created_at: string | null
          id: string
          name: string
          owner_id: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string
          subscription_status: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_free_window_hours?: number
          cancellation_late_refund_percent?: number
          cancellation_policy_type?: string
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_free_window_hours?: number
          cancellation_late_refund_percent?: number
          cancellation_policy_type?: string
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_connect_accounts: {
        Row: {
          charges_enabled: boolean | null
          created_at: string | null
          details_submitted: boolean | null
          id: string
          organization_id: string
          payouts_enabled: boolean | null
          stripe_account_id: string
          updated_at: string | null
        }
        Insert: {
          charges_enabled?: boolean | null
          created_at?: string | null
          details_submitted?: boolean | null
          id?: string
          organization_id: string
          payouts_enabled?: boolean | null
          stripe_account_id: string
          updated_at?: string | null
        }
        Update: {
          charges_enabled?: boolean | null
          created_at?: string | null
          details_submitted?: boolean | null
          id?: string
          organization_id?: string
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_connect_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          capacity: number
          conditions_notes: string | null
          created_at: string | null
          deposit_cents: number | null
          deposit_required: boolean | null
          description: string | null
          duration: string
          id: string
          name: string
          organization_id: string
          price_cents: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number
          conditions_notes?: string | null
          created_at?: string | null
          deposit_cents?: number | null
          deposit_required?: boolean | null
          description?: string | null
          duration: string
          id?: string
          name: string
          organization_id: string
          price_cents: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          conditions_notes?: string | null
          created_at?: string | null
          deposit_cents?: number | null
          deposit_required?: boolean | null
          description?: string | null
          duration?: string
          id?: string
          name?: string
          organization_id?: string
          price_cents?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_count_organizations: {
        Args: { search_query?: string }
        Returns: number
      }
      admin_count_users: { Args: { search_query?: string }; Returns: number }
      admin_get_metrics: { Args: never; Returns: Json }
      admin_list_organizations: {
        Args: {
          page_number?: number
          page_size?: number
          search_query?: string
        }
        Returns: Json
      }
      admin_list_users: {
        Args: {
          page_number?: number
          page_size?: number
          search_query?: string
        }
        Returns: Json
      }
      get_org_members_with_email: {
        Args: { org_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }[]
      }
      get_org_role: { Args: { org_id: string; uid: string }; Returns: string }
      is_org_member: { Args: { org_id: string; uid: string }; Returns: boolean }
      is_system_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

