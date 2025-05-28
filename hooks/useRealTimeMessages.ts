"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

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
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!communityId) {
      setMessages([])
      setLoading(false)
      return
    }

    let isMounted = true

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching messages for community:", communityId)

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
        } else if (isMounted) {
          console.log("Fetched messages:", data)
          setMessages(data as Message[])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        if (isMounted) {
          setError("Failed to load messages")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMessages()

    // Clean up previous subscription
    if (channelRef.current) {
      console.log("Unsubscribing from previous channel")
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Create new channel for real-time updates
    const channelName = `messages:community_id=eq.${communityId}`
    console.log("Creating channel:", channelName)

    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          console.log("Real-time message received:", payload)

          if (!isMounted) return

          try {
            // Fetch the complete message with profile data
            const { data: messageData, error: messageError } = await supabase
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

            if (messageError) {
              console.error("Error fetching new message details:", messageError)
              return
            }

            if (messageData && isMounted) {
              console.log("Adding new message to state:", messageData)
              setMessages((prevMessages) => {
                // Check if message already exists to prevent duplicates
                const exists = prevMessages.some((msg) => msg.id === messageData.id)
                if (exists) {
                  console.log("Message already exists, skipping")
                  return prevMessages
                }
                return [...prevMessages, messageData as Message]
              })
            }
          } catch (err) {
            console.error("Error processing real-time message:", err)
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time updates")
        } else if (status === "CHANNEL_ERROR") {
          console.error("Channel subscription error")
          if (isMounted) {
            setError("Real-time connection failed")
          }
        }
      })

    return () => {
      isMounted = false
      if (channelRef.current) {
        console.log("Cleaning up channel subscription")
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
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
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            is_online
          )
        `)
        .single()

      if (error) {
        console.error("Error sending message:", error)
        throw error
      }

      console.log("Message sent successfully:", data)

      // Note: We don't add the message to state here because the real-time subscription will handle it
      // This prevents duplicate messages

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
