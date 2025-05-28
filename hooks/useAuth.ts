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
      setLoading(true)

      // Query for profiles without using .single()
      const { data: profiles, error } = await supabase.from("profiles").select("*").eq("id", userId)

      if (error) {
        console.error("Error querying profiles:", error)
        setProfile(null)
        setLoading(false)
        return
      }

      console.log("Profile query result:", profiles)

      // Handle different cases
      if (!profiles || profiles.length === 0) {
        console.log("No profile found, user needs to complete setup")
        setProfile(null)
      } else if (profiles.length === 1) {
        console.log("Profile found:", profiles[0])
        setProfile(profiles[0])
      } else {
        console.warn("Multiple profiles found, using first one:", profiles)
        setProfile(profiles[0])
      }
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error)
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
