"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Community = Database["public"]["Tables"]["communities"]["Row"]

export function useCommunities(userId: string | null) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setCommunities([])
      setLoading(false)
      return
    }

    const fetchCommunities = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("community_members")
          .select(`
        communities (
          id,
          name,
          description,
          class_number,
          graduation_year,
          school_name,
          icon,
          color,
          member_count,
          created_at,
          updated_at
        )
      `)
          .eq("user_id", userId)

        if (fetchError) {
          console.error("Error fetching communities:", fetchError)
          setError(fetchError.message)
        } else {
          const communitiesData = data?.map((item) => item.communities).filter(Boolean) as Community[]
          setCommunities(communitiesData || [])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Failed to load communities")
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()
  }, [userId])

  return {
    communities,
    loading,
    error,
  }
}

// After API call
// Instead of updating local state, refetch from the server:
await refetchProfile();      // Custom hook or function to fetch latest profile
await refetchCommunities();  // Custom hook or function to fetch latest communities
