"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
    is_online: boolean
  }
}

export function useRealTimeMessages(communityId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!communityId) {
      setMessages([])
      setLoading(false)
      return
    }

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("messages")
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url,
              is_online
            )
          `)
          .eq("community_id", communityId)
          .order("created_at", { ascending: true })

        if (fetchError) {
          console.error("Error fetching messages:", fetchError)
          setError(fetchError.message)
        } else {
          setMessages(data as Message[])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Failed to load messages")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Clean up previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    // Subscribe to real-time changes
    subscriptionRef.current = supabase
      .channel(`messages-${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          console.log("New message received:", payload)

          // Fetch the complete message with profile data
          const { data } = await supabase
            .from("messages")
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url,
                is_online
              )
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as Message])
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [communityId])

  const sendMessage = async (content: string, userId: string) => {
    if (!communityId || !content.trim()) {
      throw new Error("Missing community ID or content")
    }

    try {
      console.log("Sending message:", { content, userId, communityId })

      const { data, error } = await supabase
        .from("messages")
        .insert({
          content: content.trim(),
          user_id: userId,
          community_id: communityId,
        })
        .select()

      if (error) {
        console.error("Error sending message:", error)
        throw error
      }

      console.log("Message sent successfully:", data)
      return data
    } catch (err) {
      console.error("Failed to send message:", err)
      throw err
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
  }
}
