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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addition_scores: {
        Row: {
          completed_at: string
          id: string
          score: number
          user_id: string | null
          username: string
        }
        Insert: {
          completed_at?: string
          id?: string
          score: number
          user_id?: string | null
          username: string
        }
        Update: {
          completed_at?: string
          id?: string
          score?: number
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      ag5_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          height: string
          id: string
          phone_number: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          height: string
          id?: string
          phone_number: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          height?: string
          id?: string
          phone_number?: string
        }
        Relationships: []
      }
      contact_form: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      contact_form_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          created_at: string
          email: string
          id: string
          payment_status: string | null
          phone: string
          prize_amount: number
          stripe_session_id: string | null
          tee_order: number
          terms_agreed: boolean
          updated_at: string
          user_name: string
          wager_amount: number
          wager_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          payment_status?: string | null
          phone: string
          prize_amount: number
          stripe_session_id?: string | null
          tee_order: number
          terms_agreed?: boolean
          updated_at?: string
          user_name: string
          wager_amount: number
          wager_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          payment_status?: string | null
          phone?: string
          prize_amount?: number
          stripe_session_id?: string | null
          tee_order?: number
          terms_agreed?: boolean
          updated_at?: string
          user_name?: string
          wager_amount?: number
          wager_type?: string
        }
        Relationships: []
      }
      division_scores: {
        Row: {
          completed_at: string
          id: string
          score: number
          user_id: string | null
          username: string
        }
        Insert: {
          completed_at?: string
          id?: string
          score: number
          user_id?: string | null
          username: string
        }
        Update: {
          completed_at?: string
          id?: string
          score?: number
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      multiplication_scores: {
        Row: {
          completed_at: string
          id: string
          score: number
          user_id: string | null
          username: string
        }
        Insert: {
          completed_at?: string
          id?: string
          score: number
          user_id?: string | null
          username: string
        }
        Update: {
          completed_at?: string
          id?: string
          score?: number
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      partnership_inquiries: {
        Row: {
          contact_name: string
          course_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          phone: string | null
        }
        Insert: {
          contact_name: string
          course_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone?: string | null
        }
        Update: {
          contact_name?: string
          course_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          addition_proficient: boolean | null
          addition_top_score: number | null
          created_at: string | null
          division_proficient: boolean | null
          division_top_score: number | null
          id: string
          is_premium: boolean | null
          multiplication_proficient: boolean | null
          multiplication_top_score: number | null
          parent_email: string | null
          parent_first_name: string | null
          parent_last_name: string | null
          passcode: string
          student_dob: string | null
          student_first_name: string | null
          student_last_name: string | null
          subtraction_proficient: boolean | null
          subtraction_top_score: number | null
          total_bananas: number | null
          updated_at: string | null
          username: string
          wallet_address: string | null
        }
        Insert: {
          addition_proficient?: boolean | null
          addition_top_score?: number | null
          created_at?: string | null
          division_proficient?: boolean | null
          division_top_score?: number | null
          id: string
          is_premium?: boolean | null
          multiplication_proficient?: boolean | null
          multiplication_top_score?: number | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          passcode: string
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          subtraction_proficient?: boolean | null
          subtraction_top_score?: number | null
          total_bananas?: number | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
        }
        Update: {
          addition_proficient?: boolean | null
          addition_top_score?: number | null
          created_at?: string | null
          division_proficient?: boolean | null
          division_top_score?: number | null
          id?: string
          is_premium?: boolean | null
          multiplication_proficient?: boolean | null
          multiplication_top_score?: number | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          passcode?: string
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          subtraction_proficient?: boolean | null
          subtraction_top_score?: number | null
          total_bananas?: number | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          reward_type: string
          rewards_code_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          reward_type?: string
          rewards_code_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          reward_type?: string
          rewards_code_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_rewards_code_id_fkey"
            columns: ["rewards_code_id"]
            isOneToOne: false
            referencedRelation: "rewards_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subtraction_scores: {
        Row: {
          completed_at: string
          id: string
          score: number
          user_id: string | null
          username: string
        }
        Insert: {
          completed_at?: string
          id?: string
          score: number
          user_id?: string | null
          username: string
        }
        Update: {
          completed_at?: string
          id?: string
          score?: number
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          addition_proficient: boolean | null
          addition_top_score: number | null
          created_at: string | null
          division_proficient: boolean | null
          division_top_score: number | null
          id: string
          is_premium: boolean
          last_reset: string | null
          multiplication_proficient: boolean | null
          multiplication_top_score: number | null
          parent_email: string | null
          parent_first_name: string | null
          parent_last_name: string | null
          passcode: string
          student_dob: string | null
          student_first_name: string | null
          student_last_name: string | null
          subtraction_proficient: boolean | null
          subtraction_top_score: number | null
          total_bananas: number | null
          updated_at: string | null
          username: string
          wallet_address: string | null
        }
        Insert: {
          addition_proficient?: boolean | null
          addition_top_score?: number | null
          created_at?: string | null
          division_proficient?: boolean | null
          division_top_score?: number | null
          id?: string
          is_premium?: boolean
          last_reset?: string | null
          multiplication_proficient?: boolean | null
          multiplication_top_score?: number | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          passcode: string
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          subtraction_proficient?: boolean | null
          subtraction_top_score?: number | null
          total_bananas?: number | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
        }
        Update: {
          addition_proficient?: boolean | null
          addition_top_score?: number | null
          created_at?: string | null
          division_proficient?: boolean | null
          division_top_score?: number | null
          id?: string
          is_premium?: boolean
          last_reset?: string | null
          multiplication_proficient?: boolean | null
          multiplication_top_score?: number | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          passcode?: string
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          subtraction_proficient?: boolean | null
          subtraction_top_score?: number | null
          total_bananas?: number | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          bitcoin_experience: string | null
          children_count: number
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          bitcoin_experience?: string | null
          children_count: number
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          bitcoin_experience?: string | null
          children_count?: number
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_new_user: {
        Args: { passcode: string; username: string }
        Returns: string
      }
      get_top_scores_all_time: {
        Args: { game_mode: string; limit_count?: number }
        Returns: {
          completed_at: string
          id: string
          score: number
          username: string
        }[]
      }
      get_top_scores_today: {
        Args: { game_mode: string; limit_count?: number }
        Returns: {
          completed_at: string
          id: string
          score: number
          username: string
        }[]
      }
      get_user_top_score: {
        Args: { p_game_mode: string; p_user_id: string }
        Returns: number
      }
      increment_total_bananas: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
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
  public: {
    Enums: {},
  },
} as const
