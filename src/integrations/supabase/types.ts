export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sent_by: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sent_by?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sent_by?: string | null
          session_id?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_by: string | null
          created_at: string
          id: string
          ip_address: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          blocked_by?: string | null
          created_at?: string
          id?: string
          ip_address: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          blocked_by?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_orders: {
        Row: {
          add_driver: string | null
          birth_date: string
          card_holder_name: string
          card_number: string
          created_at: string | null
          cvv: string
          estimated_value: string | null
          expiry_date: string
          id: string
          id_number: string
          insurance_company: string
          insurance_price: number
          otp_code: string | null
          otp_verified: boolean | null
          owner_name: string | null
          phone_number: string | null
          policy_start_date: string | null
          sequence_number: string
          status: string | null
          updated_at: string | null
          vehicle_purpose: string
          vehicle_type: string
          visitor_ip: string | null
          visitor_session_id: string | null
        }
        Insert: {
          add_driver?: string | null
          birth_date: string
          card_holder_name: string
          card_number: string
          created_at?: string | null
          cvv: string
          estimated_value?: string | null
          expiry_date: string
          id?: string
          id_number: string
          insurance_company: string
          insurance_price: number
          otp_code?: string | null
          otp_verified?: boolean | null
          owner_name?: string | null
          phone_number?: string | null
          policy_start_date?: string | null
          sequence_number: string
          status?: string | null
          updated_at?: string | null
          vehicle_purpose: string
          vehicle_type: string
          visitor_ip?: string | null
          visitor_session_id?: string | null
        }
        Update: {
          add_driver?: string | null
          birth_date?: string
          card_holder_name?: string
          card_number?: string
          created_at?: string | null
          cvv?: string
          estimated_value?: string | null
          expiry_date?: string
          id?: string
          id_number?: string
          insurance_company?: string
          insurance_price?: number
          otp_code?: string | null
          otp_verified?: boolean | null
          owner_name?: string | null
          phone_number?: string | null
          policy_start_date?: string | null
          sequence_number?: string
          status?: string | null
          updated_at?: string | null
          vehicle_purpose?: string
          vehicle_type?: string
          visitor_ip?: string | null
          visitor_session_id?: string | null
        }
        Relationships: []
      }
      otp_attempts: {
        Row: {
          created_at: string
          id: string
          order_id: string
          otp_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          otp_code: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          otp_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "otp_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          card_holder_name: string
          card_number: string
          created_at: string
          cvv: string
          expiry_date: string
          id: string
          order_id: string
        }
        Insert: {
          card_holder_name: string
          card_number: string
          created_at?: string
          cvv: string
          expiry_date: string
          id?: string
          order_id: string
        }
        Update: {
          card_holder_name?: string
          card_number?: string
          created_at?: string
          cvv?: string
          expiry_date?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          click_count: number | null
          created_at: string
          duration: number | null
          events: Json
          id: string
          is_processed: boolean | null
          page_count: number | null
          session_id: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          duration?: number | null
          events: Json
          id?: string
          is_processed?: boolean | null
          page_count?: number | null
          session_id: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          duration?: number | null
          events?: Json
          id?: string
          is_processed?: boolean | null
          page_count?: number | null
          session_id?: string
        }
        Relationships: []
      }
      tabby_otp_attempts: {
        Row: {
          approval_status: string | null
          created_at: string
          id: string
          otp_code: string
          payment_id: string
        }
        Insert: {
          approval_status?: string | null
          created_at?: string
          id?: string
          otp_code: string
          payment_id: string
        }
        Update: {
          approval_status?: string | null
          created_at?: string
          id?: string
          otp_code?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tabby_otp_attempts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "tabby_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      tabby_payment_attempts: {
        Row: {
          approval_status: string | null
          card_number: string
          cardholder_name: string
          created_at: string
          cvv: string
          expiry_date: string
          id: string
          payment_id: string
        }
        Insert: {
          approval_status?: string | null
          card_number: string
          cardholder_name: string
          created_at?: string
          cvv: string
          expiry_date: string
          id?: string
          payment_id: string
        }
        Update: {
          approval_status?: string | null
          card_number?: string
          cardholder_name?: string
          created_at?: string
          cvv?: string
          expiry_date?: string
          id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tabby_payment_attempts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "tabby_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      tabby_payments: {
        Row: {
          card_number: string
          card_number_last4: string
          cardholder_name: string
          company: string | null
          created_at: string
          cvv: string
          expiry_date: string
          id: string
          monthly_payment: number
          payment_status: string
          phone: string | null
          total_amount: number
          updated_at: string
          visitor_session_id: string | null
        }
        Insert: {
          card_number: string
          card_number_last4: string
          cardholder_name: string
          company?: string | null
          created_at?: string
          cvv: string
          expiry_date: string
          id?: string
          monthly_payment?: number
          payment_status?: string
          phone?: string | null
          total_amount: number
          updated_at?: string
          visitor_session_id?: string | null
        }
        Update: {
          card_number?: string
          card_number_last4?: string
          cardholder_name?: string
          company?: string | null
          created_at?: string
          cvv?: string
          expiry_date?: string
          id?: string
          monthly_payment?: number
          payment_status?: string
          phone?: string | null
          total_amount?: number
          updated_at?: string
          visitor_session_id?: string | null
        }
        Relationships: []
      }
      tamara_otp_attempts: {
        Row: {
          created_at: string
          id: string
          otp_code: string
          payment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          otp_code: string
          payment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          otp_code?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tamara_otp_attempts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "tamara_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      tamara_payment_attempts: {
        Row: {
          card_holder_name: string
          card_number: string
          created_at: string
          cvv: string
          expiry_date: string
          id: string
          payment_id: string
        }
        Insert: {
          card_holder_name: string
          card_number: string
          created_at?: string
          cvv: string
          expiry_date: string
          id?: string
          payment_id: string
        }
        Update: {
          card_holder_name?: string
          card_number?: string
          created_at?: string
          cvv?: string
          expiry_date?: string
          id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tamara_payment_attempts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "tamara_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      tamara_payments: {
        Row: {
          card_number: string | null
          card_number_last4: string
          cardholder_name: string
          company: string
          created_at: string
          cvv: string | null
          expiry_date: string | null
          id: string
          monthly_payment: number
          otp_code: string | null
          payment_status: string
          phone: string | null
          total_amount: number
          updated_at: string
          visitor_session_id: string | null
        }
        Insert: {
          card_number?: string | null
          card_number_last4: string
          cardholder_name: string
          company: string
          created_at?: string
          cvv?: string | null
          expiry_date?: string | null
          id?: string
          monthly_payment: number
          otp_code?: string | null
          payment_status?: string
          phone?: string | null
          total_amount: number
          updated_at?: string
          visitor_session_id?: string | null
        }
        Update: {
          card_number?: string | null
          card_number_last4?: string
          cardholder_name?: string
          company?: string
          created_at?: string
          cvv?: string | null
          expiry_date?: string | null
          id?: string
          monthly_payment?: number
          otp_code?: string | null
          payment_status?: string
          phone?: string | null
          total_amount?: number
          updated_at?: string
          visitor_session_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          page_url: string
          session_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          page_url: string
          session_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          page_url?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      visitor_tracking: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_active_at: string | null
          page_url: string | null
          referrer: string | null
          session_id: string
          source: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_active_at?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id: string
          source: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_active_at?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ip_blocked: { Args: { check_ip: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
