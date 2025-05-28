"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      // First, try to get the profile - DO NOT use .single()
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId)

      if (error) {
        console.error("Error fetching profile:", error)
        throw error
      }

      console.log("Profile query result:", data)

      if (!data || data.length === 0) {
        console.log("No profile found for user, creating a default profile")

        // Create a default profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: "user@example.com", // This will be updated later
            full_name: "New User",
            class_number: 1,
            graduation_year: new Date().getFullYear() + 4,
            school_name: "Default School",
          })
          .select()

        if (createError) {
          console.error("Error creating default profile:", createError)
          setProfile(null)
        } else {
          console.log("Created default profile:", newProfile?.[0])
          setProfile(newProfile?.[0] || null)
        }
      } else if (data.length === 1) {
        console.log("Profile found:", data[0])
        setProfile(data[0])
      } else {
        console.warn("Multiple profiles found for user:", data)
        // Use the first profile if multiple exist
        setProfile(data[0])
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
  }
}
