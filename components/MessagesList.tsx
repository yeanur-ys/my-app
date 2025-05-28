"use client"

import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"
import { Loader2 } from "lucide-react"

interface MessagesListProps {
  messages: any[]
  loading: boolean
  error: string | null
}

export function MessagesList({ messages, loading, error }: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading messages...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load messages</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No messages yet. Be the first to say hello! 👋</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-0">
      {messages.map((message) => (
        <div key={message.id} className="group">
          <MessageBubble message={message} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
