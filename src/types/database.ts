// Tipos TypeScript del esquema de Supabase.
// Se actualizan manualmente al añadir tablas en las migraciones.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProspectStatus = 'nuevo' | 'contactado' | 'respondio' | 'reunion' | 'ganado' | 'perdido'
export type MessageChannel = 'whatsapp' | 'llamada' | 'email'
export type PlanStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type UsageAction = 'search' | 'audit' | 'message' | 'pagespeed'

export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string
          service_description: string
          service_promise: string | null
          social_proof: string | null
          ideal_client: string | null
          communication_tone: string
          business_name: string | null
          logo_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          service_description: string
          service_promise?: string | null
          social_proof?: string | null
          ideal_client?: string | null
          communication_tone?: string
          business_name?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_description?: string
          service_promise?: string | null
          social_proof?: string | null
          ideal_client?: string | null
          communication_tone?: string
          business_name?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          place_id: string
          name: string
          address: string | null
          city: string | null
          phone: string | null
          website: string | null
          category: string | null
          lat: number | null
          lng: number | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          name: string
          address?: string | null
          city?: string | null
          phone?: string | null
          website?: string | null
          category?: string | null
          lat?: number | null
          lng?: number | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          place_id?: string
          name?: string
          address?: string | null
          city?: string | null
          phone?: string | null
          website?: string | null
          category?: string | null
          lat?: number | null
          lng?: number | null
          raw_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          id: string
          business_id: string
          user_id: string
          total_score: number
          breakdown: Json
          pagespeed_data: Json | null
          measured_at: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          total_score: number
          breakdown?: Json
          pagespeed_data?: Json | null
          measured_at?: string
          created_at?: string
        }
        Update: {
          total_score?: number
          breakdown?: Json
          pagespeed_data?: Json | null
          measured_at?: string
        }
        Relationships: []
      }
      signal_weights: {
        Row: {
          id: string
          user_id: string
          signal_key: string
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          signal_key: string
          weight: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          signal_key?: string
          weight?: number
          updated_at?: string
        }
        Relationships: []
      }
      prospects: {
        Row: {
          id: string
          user_id: string
          business_id: string
          status: ProspectStatus
          notes: string | null
          next_contact_at: string | null
          contacted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          status?: ProspectStatus
          notes?: string | null
          next_contact_at?: string | null
          contacted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: ProspectStatus
          notes?: string | null
          next_contact_at?: string | null
          contacted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          id: string
          user_id: string
          business_id: string
          score_id: string | null
          pdf_url: string | null
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          score_id?: string | null
          pdf_url?: string | null
          generated_at?: string
          created_at?: string
        }
        Update: {
          score_id?: string | null
          pdf_url?: string | null
          generated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          user_id: string
          prospect_id: string
          channel: MessageChannel
          content: string
          variant: number
          is_followup: boolean
          followup_day: number | null
          copied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prospect_id: string
          channel: MessageChannel
          content: string
          variant?: number
          is_followup?: boolean
          followup_day?: number | null
          copied_at?: string | null
          created_at?: string
        }
        Update: {
          channel?: MessageChannel
          content?: string
          variant?: number
          is_followup?: boolean
          followup_day?: number | null
          copied_at?: string | null
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          action: UsageAction
          metadata: Json
          estimated_cost_usd: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: UsageAction
          metadata?: Json
          estimated_cost_usd?: number | null
          created_at?: string
        }
        Update: {
          action?: UsageAction
          metadata?: Json
          estimated_cost_usd?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'agency'
          status: PlanStatus
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'agency'
          status?: PlanStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'agency'
          status?: PlanStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          type: string
          data: Json
          processed_at: string
        }
        Insert: {
          id: string
          type: string
          data: Json
          processed_at?: string
        }
        Update: {
          type?: string
          data?: Json
          processed_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type UserProfile = Database['public']['Tables']['users_profile']['Row']
export type UserProfileInsert = Database['public']['Tables']['users_profile']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['users_profile']['Update']

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export type Score = Database['public']['Tables']['scores']['Row']
export type ScoreInsert = Database['public']['Tables']['scores']['Insert']

export type SignalWeight = Database['public']['Tables']['signal_weights']['Row']
export type SignalWeightInsert = Database['public']['Tables']['signal_weights']['Insert']

export type Prospect = Database['public']['Tables']['prospects']['Row']
export type ProspectInsert = Database['public']['Tables']['prospects']['Insert']
export type ProspectUpdate = Database['public']['Tables']['prospects']['Update']

export type Audit = Database['public']['Tables']['audits']['Row']
export type AuditInsert = Database['public']['Tables']['audits']['Insert']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type UsageLogInsert = Database['public']['Tables']['usage_logs']['Insert']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type StripeEvent = Database['public']['Tables']['stripe_events']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
