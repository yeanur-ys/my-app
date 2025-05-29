import { createClient } from "@supabase/supabase-js"
import type { Database } from "./supabase"

// Create a Supabase client with the service role key for admin operations
// This bypasses RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY not found, using anon key")
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
