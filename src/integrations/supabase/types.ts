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
          end_char: number | null
          id: string
          start_char: number | null
        }
        Insert: {
          advisor_id: string
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id: string
          embedding?: string | null
          end_char?: number | null
          id?: string
          start_char?: number | null
        }
        Update: {
          advisor_id?: string
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          end_char?: number | null
          id?: string
          start_char?: number | null
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
          additional_background: string | null
          areas_of_expertise: string | null
          auto_description: string | null
          avatar_url: string | null
          background_content: string | null
          background_image_url: string | null
          completion_status: Json | null
          conversation_style: string | null
          created_at: string
          creator_prompt: string | null
          crypto_wallet: string | null
          current_profession: string | null
          custom_url: string | null
          date_of_birth: string | null
          description: string | null
          edit_code: string | null
          education: string | null
          expertise_areas: string | null
          full_description: string | null
          full_name: string | null
          id: string
          integrations: Json | null
          interests: Json | null
          is_active: boolean
          is_official: boolean | null
          is_public: boolean | null
          is_verified: boolean
          knowledge_summary: string | null
          location: string | null
          marketplace_category: string | null
          name: string
          owner_welcome_message: string | null
          personality_type: string | null
          price: number | null
          professional_title: string | null
          prompt: string
          response_length: string | null
          sample_scenarios: Json | null
          sim_category: string | null
          sim_to_sim_prompt: string | null
          sim_type: string | null
          skills: Json | null
          social_links: Json | null
          stranger_prompt: string | null
          target_audience: string | null
          title: string | null
          twitter_url: string | null
          updated_at: string
          url: string | null
          user_id: string | null
          verification_deadline: string | null
          verification_post_required: string | null
          verification_status: boolean
          verified_at: string | null
          website_url: string | null
          welcome_message: string | null
          writing_sample: string | null
          x402_enabled: boolean | null
          x402_price: number | null
          x402_wallet: string | null
          years_experience: number | null
        }
        Insert: {
          additional_background?: string | null
          areas_of_expertise?: string | null
          auto_description?: string | null
          avatar_url?: string | null
          background_content?: string | null
          background_image_url?: string | null
          completion_status?: Json | null
          conversation_style?: string | null
          created_at?: string
          creator_prompt?: string | null
          crypto_wallet?: string | null
          current_profession?: string | null
          custom_url?: string | null
          date_of_birth?: string | null
          description?: string | null
          edit_code?: string | null
          education?: string | null
          expertise_areas?: string | null
          full_description?: string | null
          full_name?: string | null
          id?: string
          integrations?: Json | null
          interests?: Json | null
          is_active?: boolean
          is_official?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean
          knowledge_summary?: string | null
          location?: string | null
          marketplace_category?: string | null
          name: string
          owner_welcome_message?: string | null
          personality_type?: string | null
          price?: number | null
          professional_title?: string | null
          prompt: string
          response_length?: string | null
          sample_scenarios?: Json | null
          sim_category?: string | null
          sim_to_sim_prompt?: string | null
          sim_type?: string | null
          skills?: Json | null
          social_links?: Json | null
          stranger_prompt?: string | null
          target_audience?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
          verification_deadline?: string | null
          verification_post_required?: string | null
          verification_status?: boolean
          verified_at?: string | null
          website_url?: string | null
          welcome_message?: string | null
          writing_sample?: string | null
          x402_enabled?: boolean | null
          x402_price?: number | null
          x402_wallet?: string | null
          years_experience?: number | null
        }
        Update: {
          additional_background?: string | null
          areas_of_expertise?: string | null
          auto_description?: string | null
          avatar_url?: string | null
          background_content?: string | null
          background_image_url?: string | null
          completion_status?: Json | null
          conversation_style?: string | null
          created_at?: string
          creator_prompt?: string | null
          crypto_wallet?: string | null
          current_profession?: string | null
          custom_url?: string | null
          date_of_birth?: string | null
          description?: string | null
          edit_code?: string | null
          education?: string | null
          expertise_areas?: string | null
          full_description?: string | null
          full_name?: string | null
          id?: string
          integrations?: Json | null
          interests?: Json | null
          is_active?: boolean
          is_official?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean
          knowledge_summary?: string | null
          location?: string | null
          marketplace_category?: string | null
          name?: string
          owner_welcome_message?: string | null
          personality_type?: string | null
          price?: number | null
          professional_title?: string | null
          prompt?: string
          response_length?: string | null
          sample_scenarios?: Json | null
          sim_category?: string | null
          sim_to_sim_prompt?: string | null
          sim_type?: string | null
          skills?: Json | null
          social_links?: Json | null
          stranger_prompt?: string | null
          target_audience?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
          verification_deadline?: string | null
          verification_post_required?: string | null
          verification_status?: boolean
          verified_at?: string | null
          website_url?: string | null
          welcome_message?: string | null
          writing_sample?: string | null
          x402_enabled?: boolean | null
          x402_price?: number | null
          x402_wallet?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      agent_invite_requests: {
        Row: {
          agent_type: string
          created_at: string
          id: string
          status: string
          x_profile: string
        }
        Insert: {
          agent_type: string
          created_at?: string
          id?: string
          status?: string
          x_profile: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          id?: string
          status?: string
          x_profile?: string
        }
        Relationships: []
      }
      approved_x_creators: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          notes: string | null
          username: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          notes?: string | null
          username: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          notes?: string | null
          username?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          advisor_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          sender_email: string | null
          sender_phone: string | null
          sim_id: string | null
        }
        Insert: {
          advisor_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          sender_email?: string | null
          sender_phone?: string | null
          sim_id?: string | null
        }
        Update: {
          advisor_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          sender_email?: string | null
          sender_phone?: string | null
          sim_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_messages_sim_id_fkey"
            columns: ["sim_id"]
            isOneToOne: false
            referencedRelation: "sims"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_captures: {
        Row: {
          advisor_id: string
          conversation_id: string
          conversation_score: number | null
          created_at: string | null
          email: string | null
          id: string
          message_count: number | null
          name: string | null
          notes: string | null
          phone: string | null
          status: string | null
          trigger_reason: string | null
        }
        Insert: {
          advisor_id: string
          conversation_id: string
          conversation_score?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          message_count?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          trigger_reason?: string | null
        }
        Update: {
          advisor_id?: string
          conversation_id?: string
          conversation_score?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          message_count?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          trigger_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_captures_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_embeddings: {
        Row: {
          advisor_id: string
          content_text: string
          content_type: string
          conversation_date: string | null
          conversation_id: string
          created_at: string
          embedding: string | null
          id: string
          message_count: number | null
          metadata: Json | null
          participant_type: string | null
          updated_at: string
        }
        Insert: {
          advisor_id: string
          content_text: string
          content_type?: string
          conversation_date?: string | null
          conversation_id: string
          created_at?: string
          embedding?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          participant_type?: string | null
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          content_text?: string
          content_type?: string
          conversation_date?: string | null
          conversation_id?: string
          created_at?: string
          embedding?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          participant_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_embeddings_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          advisor_id: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_creator_conversation: boolean
          sim_id: string | null
          title: string | null
          tutor_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_creator_conversation?: boolean
          sim_id?: string | null
          title?: string | null
          tutor_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          advisor_id?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_creator_conversation?: boolean
          sim_id?: string | null
          title?: string | null
          tutor_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_sim_id_fkey"
            columns: ["sim_id"]
            isOneToOne: false
            referencedRelation: "sims"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usage_log: {
        Row: {
          conversation_id: string | null
          created_at: string
          credits_used: number
          id: string
          message_id: string | null
          usage_type: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          credits_used?: number
          id?: string
          message_id?: string | null
          usage_type?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          credits_used?: number
          id?: string
          message_id?: string | null
          usage_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_log_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_log_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefs: {
        Row: {
          advisor_id: string
          brief_content: string
          created_at: string
          id: string
          read: boolean
          scheduled_time: string
          sources: Json | null
          topic: string
        }
        Insert: {
          advisor_id: string
          brief_content: string
          created_at?: string
          id?: string
          read?: boolean
          scheduled_time: string
          sources?: Json | null
          topic: string
        }
        Update: {
          advisor_id?: string
          brief_content?: string
          created_at?: string
          id?: string
          read?: boolean
          scheduled_time?: string
          sources?: Json | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_briefs_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          sim1_id: string
          sim2_id: string
          started_at: string | null
          status: string
          topic: string
          voter_name: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          sim1_id: string
          sim2_id: string
          started_at?: string | null
          status?: string
          topic: string
          voter_name?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          sim1_id?: string
          sim2_id?: string
          started_at?: string | null
          status?: string
          topic?: string
          voter_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debate_queue_sim1_id_fkey"
            columns: ["sim1_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_queue_sim2_id_fkey"
            columns: ["sim2_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sim1"
            columns: ["sim1_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sim2"
            columns: ["sim2_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          created_at: string
          district: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          change_summary: string | null
          content: string
          content_hash: string
          created_at: string
          created_by: string | null
          document_id: string
          file_size: number | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content: string
          content_hash: string
          created_at?: string
          created_by?: string | null
          document_id: string
          file_size?: number | null
          id?: string
          title: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content?: string
          content_hash?: string
          created_at?: string
          created_by?: string | null
          document_id?: string
          file_size?: number | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "advisor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_code_attempts: {
        Row: {
          agent_id: string
          attempt_time: string
          created_at: string
          id: string
          ip_address: string | null
        }
        Insert: {
          agent_id: string
          attempt_time?: string
          created_at?: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          agent_id?: string
          attempt_time?: string
          created_at?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edit_code_attempts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          advisor_id: string
          contact_capture_enabled: boolean | null
          contact_capture_message: string | null
          created_at: string | null
          custom_keywords: string[] | null
          id: string
          is_active: boolean | null
          message_count_threshold: number | null
          score_threshold: number | null
          updated_at: string | null
          urgency_keywords: string[] | null
          value_keywords: string[] | null
          vip_keywords: string[] | null
        }
        Insert: {
          advisor_id: string
          contact_capture_enabled?: boolean | null
          contact_capture_message?: string | null
          created_at?: string | null
          custom_keywords?: string[] | null
          id?: string
          is_active?: boolean | null
          message_count_threshold?: number | null
          score_threshold?: number | null
          updated_at?: string | null
          urgency_keywords?: string[] | null
          value_keywords?: string[] | null
          vip_keywords?: string[] | null
        }
        Update: {
          advisor_id?: string
          contact_capture_enabled?: boolean | null
          contact_capture_message?: string | null
          created_at?: string | null
          custom_keywords?: string[] | null
          id?: string
          is_active?: boolean | null
          message_count_threshold?: number | null
          score_threshold?: number | null
          updated_at?: string | null
          urgency_keywords?: string[] | null
          value_keywords?: string[] | null
          vip_keywords?: string[] | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          interest: string
          message: string | null
          name: string
          organization: string
          phone: string | null
          region: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest: string
          message?: string | null
          name: string
          organization: string
          phone?: string | null
          region?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string
          message?: string | null
          name?: string
          organization?: string
          phone?: string | null
          region?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          intent: string | null
          metadata: Json | null
          role: string
          score: number | null
          urgency_level: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          intent?: string | null
          metadata?: Json | null
          role: string
          score?: number | null
          urgency_level?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          intent?: string | null
          metadata?: Json | null
          role?: string
          score?: number | null
          urgency_level?: string | null
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
      nft_purchases: {
        Row: {
          buyer_wallet: string
          completed_at: string | null
          created_at: string
          id: string
          mint_address: string
          nft_id: string
          price: number
          seller_wallet: string
          status: string
          transaction_signature: string | null
          updated_at: string
        }
        Insert: {
          buyer_wallet: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mint_address: string
          nft_id: string
          price: number
          seller_wallet: string
          status?: string
          transaction_signature?: string | null
          updated_at?: string
        }
        Update: {
          buyer_wallet?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mint_address?: string
          nft_id?: string
          price?: number
          seller_wallet?: string
          status?: string
          transaction_signature?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_purchases_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_sessions: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string
          currency: string
          expires_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          network: string
          payment_signature: string
          session_id: string
          wallet_address: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string
          currency?: string
          expires_at: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          network?: string
          payment_signature: string
          session_id: string
          wallet_address: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          network?: string
          payment_signature?: string
          session_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "advisors"
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
          progress: Json | null
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
          progress?: Json | null
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
          progress?: Json | null
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
      purchased_seats: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          purchase_date: string
          seats_purchased: number
          seats_used: number
          stripe_payment_intent_id: string | null
          total_paid: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          purchase_date?: string
          seats_purchased?: number
          seats_used?: number
          stripe_payment_intent_id?: string | null
          total_paid: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          purchase_date?: string
          seats_purchased?: number
          seats_used?: number
          stripe_payment_intent_id?: string | null
          total_paid?: number
          updated_at?: string
        }
        Relationships: []
      }
      sim_actions: {
        Row: {
          created_at: string
          description: string
          end_goal: string
          id: string
          sim_id: string
          updated_at: string
          usdc_amount: number | null
        }
        Insert: {
          created_at?: string
          description: string
          end_goal: string
          id?: string
          sim_id: string
          updated_at?: string
          usdc_amount?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          end_goal?: string
          id?: string
          sim_id?: string
          updated_at?: string
          usdc_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sim_actions_sim_id_fkey"
            columns: ["sim_id"]
            isOneToOne: false
            referencedRelation: "sims"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_likes: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          session_id: string | null
          sim_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          sim_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          sim_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sim_likes_sim_id_fkey"
            columns: ["sim_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      sims: {
        Row: {
          avatar_url: string | null
          created_at: string
          creator_prompt: string | null
          crypto_wallet: string
          custom_url: string | null
          description: string | null
          edit_code: string
          exploration_frequency: number | null
          exploration_style: string | null
          id: string
          integrations: Json | null
          interaction_autonomy: number | null
          interaction_style: string | null
          is_active: boolean
          is_public: boolean
          is_verified: boolean
          name: string
          objective_focus: number | null
          primary_objective: string | null
          prompt: string
          sim_to_sim_prompt: string | null
          social_links: Json | null
          stranger_prompt: string | null
          training_completed: boolean | null
          training_post_count: number | null
          twitter_url: string
          updated_at: string
          user_id: string | null
          verification_status: boolean
          verified_at: string | null
          welcome_message: string | null
          x_display_name: string | null
          x_username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creator_prompt?: string | null
          crypto_wallet: string
          custom_url?: string | null
          description?: string | null
          edit_code: string
          exploration_frequency?: number | null
          exploration_style?: string | null
          id?: string
          integrations?: Json | null
          interaction_autonomy?: number | null
          interaction_style?: string | null
          is_active?: boolean
          is_public?: boolean
          is_verified?: boolean
          name: string
          objective_focus?: number | null
          primary_objective?: string | null
          prompt: string
          sim_to_sim_prompt?: string | null
          social_links?: Json | null
          stranger_prompt?: string | null
          training_completed?: boolean | null
          training_post_count?: number | null
          twitter_url: string
          updated_at?: string
          user_id?: string | null
          verification_status?: boolean
          verified_at?: string | null
          welcome_message?: string | null
          x_display_name?: string | null
          x_username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creator_prompt?: string | null
          crypto_wallet?: string
          custom_url?: string | null
          description?: string | null
          edit_code?: string
          exploration_frequency?: number | null
          exploration_style?: string | null
          id?: string
          integrations?: Json | null
          interaction_autonomy?: number | null
          interaction_style?: string | null
          is_active?: boolean
          is_public?: boolean
          is_verified?: boolean
          name?: string
          objective_focus?: number | null
          primary_objective?: string | null
          prompt?: string
          sim_to_sim_prompt?: string | null
          social_links?: Json | null
          stranger_prompt?: string | null
          training_completed?: boolean | null
          training_post_count?: number | null
          twitter_url?: string
          updated_at?: string
          user_id?: string | null
          verification_status?: boolean
          verified_at?: string | null
          welcome_message?: string | null
          x_display_name?: string | null
          x_username?: string
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
          auto_description: string | null
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
          auto_description?: string | null
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
          auto_description?: string | null
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
      user_credits: {
        Row: {
          created_at: string
          id: string
          reset_date: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reset_date?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reset_date?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          integration_type: string
          metadata: Json | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_type: string
          metadata?: Json | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string
          metadata?: Json | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      x_agent_offerings: {
        Row: {
          agent_avatar_url: string | null
          agent_data_source: string | null
          agent_functionality: string | null
          agent_id: string
          agent_system_prompt: string | null
          blur_preview: boolean | null
          created_at: string
          delivery_method: string
          description: string
          digital_file_url: string | null
          id: string
          integrations: Json | null
          is_active: boolean | null
          media_url: string | null
          offering_type: string | null
          price: number
          price_per_conversation: number | null
          required_info: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          agent_avatar_url?: string | null
          agent_data_source?: string | null
          agent_functionality?: string | null
          agent_id: string
          agent_system_prompt?: string | null
          blur_preview?: boolean | null
          created_at?: string
          delivery_method: string
          description: string
          digital_file_url?: string | null
          id?: string
          integrations?: Json | null
          is_active?: boolean | null
          media_url?: string | null
          offering_type?: string | null
          price?: number
          price_per_conversation?: number | null
          required_info?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          agent_avatar_url?: string | null
          agent_data_source?: string | null
          agent_functionality?: string | null
          agent_id?: string
          agent_system_prompt?: string | null
          blur_preview?: boolean | null
          created_at?: string
          delivery_method?: string
          description?: string
          digital_file_url?: string | null
          id?: string
          integrations?: Json | null
          is_active?: boolean | null
          media_url?: string | null
          offering_type?: string | null
          price?: number
          price_per_conversation?: number | null
          required_info?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "x_agent_offerings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      x_agent_purchases: {
        Row: {
          agent_id: string
          buyer_info: Json
          created_at: string
          fulfilled_at: string | null
          id: string
          offering_id: string
          payment_amount: number
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          buyer_info?: Json
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          offering_id: string
          payment_amount: number
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          buyer_info?: Json
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          offering_id?: string
          payment_amount?: number
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "x_agent_purchases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "x_agent_purchases_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "x_agent_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      x_messages: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          payment_amount: number
          response: string | null
          response_at: string | null
          sender_name: string
          session_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          payment_amount?: number
          response?: string | null
          response_at?: string | null
          sender_name: string
          session_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          payment_amount?: number
          response?: string | null
          response_at?: string | null
          sender_name?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "x_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      x_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string | null
          request_type: string
          status: string
          twitter_handle: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name?: string | null
          request_type: string
          status?: string
          twitter_handle?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string | null
          request_type?: string
          status?: string
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_edit_code_rate_limit: {
        Args: { p_agent_id: string }
        Returns: boolean
      }
      cleanup_expired_payment_sessions: { Args: never; Returns: number }
      deduct_credit: {
        Args: {
          p_conversation_id?: string
          p_message_id?: string
          p_usage_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
      delete_contact_message_with_code: {
        Args: {
          p_advisor_id: string
          p_edit_code: string
          p_message_id: string
        }
        Returns: undefined
      }
      generate_url_slug: { Args: { input_name: string }; Returns: string }
      get_contact_messages_with_code: {
        Args: { p_advisor_id: string; p_edit_code: string }
        Returns: {
          advisor_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          sender_email: string
          sender_phone: string
        }[]
      }
      get_conversation_insights: {
        Args: { days_back?: number; target_advisor_id: string }
        Returns: {
          anonymous_conversations: number
          avg_messages_per_conversation: number
          recent_themes: Json
          total_conversations: number
          total_messages: number
        }[]
      }
      is_approved_x_creator: {
        Args: { check_username: string }
        Returns: boolean
      }
      manage_offering_with_code:
        | {
            Args: {
              p_agent_avatar_url?: string
              p_agent_data_source?: string
              p_agent_functionality?: string
              p_agent_id: string
              p_agent_system_prompt?: string
              p_blur_preview?: boolean
              p_delivery_method?: string
              p_description?: string
              p_digital_file_url?: string
              p_edit_code: string
              p_is_active?: boolean
              p_media_url?: string
              p_offering_id?: string
              p_offering_type?: string
              p_operation?: string
              p_price?: number
              p_price_per_conversation?: number
              p_required_info?: Json
              p_title?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_agent_avatar_url?: string
              p_agent_data_source?: string
              p_agent_functionality?: string
              p_agent_id: string
              p_agent_system_prompt?: string
              p_blur_preview?: boolean
              p_delivery_method?: string
              p_description?: string
              p_digital_file_url?: string
              p_edit_code: string
              p_integrations?: Json
              p_is_active?: boolean
              p_media_url?: string
              p_offering_id?: string
              p_offering_type?: string
              p_operation?: string
              p_price?: number
              p_price_per_conversation?: number
              p_required_info?: Json
              p_title?: string
            }
            Returns: Json
          }
      mark_contact_message_read_with_code: {
        Args: {
          p_advisor_id: string
          p_edit_code: string
          p_message_id: string
        }
        Returns: undefined
      }
      record_failed_edit_code_attempt: {
        Args: { p_agent_id: string; p_ip_address?: string }
        Returns: undefined
      }
      reset_monthly_credits: { Args: never; Returns: undefined }
      respond_to_x_message_with_code: {
        Args: {
          p_agent_id: string
          p_edit_code: string
          p_message_id: string
          p_response: string
        }
        Returns: boolean
      }
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
      search_conversation_embeddings:
        | {
            Args: {
              match_count?: number
              query_embedding: string
              similarity_threshold?: number
              target_advisor_id: string
            }
            Returns: {
              content_text: string
              conversation_date: string
              conversation_id: string
              message_count: number
              metadata: Json
              similarity: number
            }[]
          }
        | {
            Args: {
              content_types?: string[]
              date_from?: string
              date_to?: string
              match_count?: number
              query_embedding: string
              similarity_threshold?: number
              target_advisor_id: string
            }
            Returns: {
              content_text: string
              content_type: string
              conversation_date: string
              conversation_id: string
              message_count: number
              metadata: Json
              similarity: number
            }[]
          }
      update_sim_with_code: {
        Args: {
          p_avatar_url?: string
          p_category: string
          p_description: string
          p_edit_code: string
          p_integrations?: Json
          p_name: string
          p_prompt: string
          p_sim_id: string
          p_social_links?: Json
          p_welcome_message: string
        }
        Returns: boolean
      }
      validate_payment_session: {
        Args: { p_session_id: string; p_wallet_address: string }
        Returns: boolean
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
