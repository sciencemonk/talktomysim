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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      advisor_documents: {
        Row: {
          advisor_id: string
          content: string
          created_at: string
          file_size: number | null
          file_type: string
          id: string
          processed_at: string | null
          title: string
          updated_at: string
          upload_date: string
        }
        Insert: {
          advisor_id: string
          content: string
          created_at?: string
          file_size?: number | null
          file_type: string
          id?: string
          processed_at?: string | null
          title: string
          updated_at?: string
          upload_date?: string
        }
        Update: {
          advisor_id?: string
          content?: string
          created_at?: string
          file_size?: number | null
          file_type?: string
          id?: string
          processed_at?: string | null
          title?: string
          updated_at?: string
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_documents_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_embeddings: {
        Row: {
          advisor_id: string
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
        }
        Insert: {
          advisor_id: string
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
        }
        Update: {
          advisor_id?: string
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_embeddings_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "advisor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          avatar_url: string | null
          background_content: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          knowledge_summary: string | null
          name: string
          prompt: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          background_content?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          knowledge_summary?: string | null
          name: string
          prompt: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          background_content?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          knowledge_summary?: string | null
          name?: string
          prompt?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          advisor_id: string | null
          created_at: string | null
          id: string
          title: string | null
          tutor_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          tutor_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          tutor_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          is_premium: boolean | null
          parent_email: string | null
          parent_first_name: string | null
          parent_last_name: string | null
          passcode: string
          student_dob: string | null
          student_first_name: string | null
          student_last_name: string | null
          total_bananas: number | null
          updated_at: string | null
          username: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_premium?: boolean | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          passcode: string
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          total_bananas?: number | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          parent_email?: string | null
          parent_first_name?: string | null
          parent_last_name?: string | null
          passcode?: string
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          total_bananas?: number | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      tutors: {
        Row: {
          avatar: string | null
          avm_score: number | null
          channel_configs: Json | null
          channels: Json | null
          created_at: string | null
          csat: number | null
          custom_subject: string | null
          custom_voice_id: string | null
          description: string | null
          email: string | null
          grade_level: string | null
          helpfulness_score: number | null
          id: string
          interactions: number | null
          is_personal: boolean | null
          learning_objective: string | null
          model: string | null
          name: string
          performance: number | null
          phone: string | null
          prompt: string | null
          purpose: string | null
          status: string
          students_saved: number | null
          subject: string | null
          teaching_style: string | null
          type: string
          updated_at: string | null
          user_id: string
          voice: string | null
          voice_provider: string | null
          voice_traits: Json | null
        }
        Insert: {
          avatar?: string | null
          avm_score?: number | null
          channel_configs?: Json | null
          channels?: Json | null
          created_at?: string | null
          csat?: number | null
          custom_subject?: string | null
          custom_voice_id?: string | null
          description?: string | null
          email?: string | null
          grade_level?: string | null
          helpfulness_score?: number | null
          id?: string
          interactions?: number | null
          is_personal?: boolean | null
          learning_objective?: string | null
          model?: string | null
          name: string
          performance?: number | null
          phone?: string | null
          prompt?: string | null
          purpose?: string | null
          status?: string
          students_saved?: number | null
          subject?: string | null
          teaching_style?: string | null
          type?: string
          updated_at?: string | null
          user_id: string
          voice?: string | null
          voice_provider?: string | null
          voice_traits?: Json | null
        }
        Update: {
          avatar?: string | null
          avm_score?: number | null
          channel_configs?: Json | null
          channels?: Json | null
          created_at?: string | null
          csat?: number | null
          custom_subject?: string | null
          custom_voice_id?: string | null
          description?: string | null
          email?: string | null
          grade_level?: string | null
          helpfulness_score?: number | null
          id?: string
          interactions?: number | null
          is_personal?: boolean | null
          learning_objective?: string | null
          model?: string | null
          name?: string
          performance?: number | null
          phone?: string | null
          prompt?: string | null
          purpose?: string | null
          status?: string
          students_saved?: number | null
          subject?: string | null
          teaching_style?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          voice?: string | null
          voice_provider?: string | null
          voice_traits?: Json | null
        }
        Relationships: []
      }
      user_advisors: {
        Row: {
          advisor_id: string
          avatar_url: string | null
          background_content: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          knowledge_summary: string | null
          name: string
          prompt: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          avatar_url?: string | null
          background_content?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          knowledge_summary?: string | null
          name: string
          prompt: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          avatar_url?: string | null
          background_content?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          knowledge_summary?: string | null
          name?: string
          prompt?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_advisor_embeddings: {
        Args: {
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
          target_advisor_id: string
        }
        Returns: {
          chunk_text: string
          document_id: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
