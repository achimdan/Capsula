// Scris de mână după supabase/migrations/20261115211537_profiles_questionnaire_tape.sql.
// Regenerează cu `supabase gen types typescript --project-id brnweurjdimvwydoiafd` după ce migrația e aplicată.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          birth_year: number | null
          city: string | null
          locality_siruta: number | null
          locality_name: string | null
          locality_county: string | null
          locality_province: string | null
          locality_development_region: string | null
          locality_is_urban: boolean | null
          reader_profile_id: string | null
          reader_traits: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          birth_year?: number | null
          city?: string | null
          locality_siruta?: number | null
          locality_name?: string | null
          locality_county?: string | null
          locality_province?: string | null
          locality_development_region?: string | null
          locality_is_urban?: boolean | null
          reader_profile_id?: string | null
          reader_traits?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          birth_year?: number | null
          city?: string | null
          locality_siruta?: number | null
          locality_name?: string | null
          locality_county?: string | null
          locality_province?: string | null
          locality_development_region?: string | null
          locality_is_urban?: boolean | null
          reader_profile_id?: string | null
          reader_traits?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          user_id: string
          answers: Json
          step: number
          is_retake: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          answers?: Json
          step?: number
          is_retake?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          answers?: Json
          step?: number
          is_retake?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tape_items: {
        Row: {
          user_id: string
          card_id: string
          added_at: string
        }
        Insert: {
          user_id: string
          card_id: string
          added_at?: string
        }
        Update: {
          user_id?: string
          card_id?: string
          added_at?: string
        }
        Relationships: []
      }
      user_cards: {
        Row: {
          id: string
          user_id: string
          title: string
          note: string
          year: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          note?: string
          year: number
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          note?: string
          year?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // supabase/migrations/20261118120000_fise.sql
      fise: {
        Row: {
          id: string
          ordine: number
          titlu: string
          nota: string
          an: number
          an_exact: boolean
          categorie: string
          oras: string | null
          verificat: boolean
          publicat: boolean
          sursa: string | null
          culori: string[]
          poza_autor: string | null
          poza_licenta: string | null
          poza_url: string | null
          poza_generata: boolean | null
          video_autor: string | null
          video_licenta: string | null
          video_url: string | null
          scena: string | null
          embed_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          ordine: number
          titlu: string
          nota: string
          an: number
          an_exact: boolean
          categorie: string
          oras?: string | null
          verificat?: boolean
          publicat?: boolean
          sursa?: string | null
          culori: string[]
          poza_autor?: string | null
          poza_licenta?: string | null
          poza_url?: string | null
          poza_generata?: boolean | null
          video_autor?: string | null
          video_licenta?: string | null
          video_url?: string | null
          scena?: string | null
          embed_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ordine?: number
          titlu?: string
          nota?: string
          an?: number
          an_exact?: boolean
          categorie?: string
          oras?: string | null
          verificat?: boolean
          publicat?: boolean
          sursa?: string | null
          culori?: string[]
          poza_autor?: string | null
          poza_licenta?: string | null
          poza_url?: string | null
          poza_generata?: boolean | null
          video_autor?: string | null
          video_licenta?: string | null
          video_url?: string | null
          scena?: string | null
          embed_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      delete_my_account: { Args: Record<string, never>, Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
