import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          class_number: number
          graduation_year: number
          school_name: string
          is_online: boolean
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          class_number: number
          graduation_year: number
          school_name?: string
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          class_number?: number
          graduation_year?: number
          school_name?: string
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          class_number: number
          graduation_year: number
          school_name: string
          icon: string
          color: string
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          class_number: number
          graduation_year: number
          school_name?: string
          icon?: string
          color?: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          class_number?: number
          graduation_year?: number
          school_name?: string
          icon?: string
          color?: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          user_id: string
          community_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          community_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          community_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          user_id: string
          community_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          community_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          community_id?: string
          joined_at?: string
        }
      }
    }
  }
}
