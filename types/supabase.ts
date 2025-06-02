// You must generate this file using Supabase CLI with your database schema.
// For now, here's a basic placeholder.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          year: number;
          class_number: number;
          avatar_url?: string;
        };
        Insert: {
          id: string;
          name: string;
          year: number;
          class_number: number;
          avatar_url?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      communities: {
        Row: {
          id: string;
          name: string;
          color: string;
          icon?: string;
          class_number: number;
          graduation_year: number;
        };
        Insert: {
          name: string;
          color: string;
          owner_id: string;
          icon?: string;
          class_number: number;
          graduation_year: number;
        };
        Update: Partial<Database["public"]["Tables"]["communities"]["Insert"]>;
      };
      community_members: {
        Row: {
          user_id: string;
          community_id: string;
        };
        Insert: {
          user_id: string;
          community_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_members"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          community_id: string;
          user_id: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
  };
}
