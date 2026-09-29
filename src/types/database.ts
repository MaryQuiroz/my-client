// Tipos TypeScript del esquema de Supabase.
// Se actualizan manualmente al añadir tablas en las migraciones.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
