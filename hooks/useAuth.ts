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
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    const fetchProfile = async (userId: string) => {
      try {
        console.log("Starting fetchProfile for user:", userId)

        if (!mounted) return

        // Use a simple select query without .single()
        const profileQuery = supabase.from("profiles").select("*").eq("id", userId)

        console.log("Executing profile query...")
        const { data: profileData, error: profileError } = await profileQuery

        if (profileError) {
          console.error("Profile query error:", profileError)
          if (mounted) {
            setProfile(null)
            setLoading(false)
          }
          return
        }

        console.log("Profile query successful, data:", profileData)

        if (!mounted) return

        // Handle the results
        if (!profileData || profileData.length === 0) {
          console.log("No profile found")
          setProfile(null)
        } else {
          console.log("Profile found:", profileData[0])
          setProfile(profileData[0])
        }

        setLoading(false)
      } catch (error) {
        console.error("Unexpected error in fetchProfile:", error)
        if (mounted) {
          setProfile(null)
          setLoading(false)
        }
      }
    }

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
