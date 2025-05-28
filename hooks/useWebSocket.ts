"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export interface Message {
  id: string
  user: {
    name: string
    avatar: string
    isOnline: boolean
  }
  content: string
  timestamp: Date
  communityId: string
}

export interface WebSocketMessage {
  type: "message" | "typing" | "user_joined" | "user_left" | "error"
  data: any
}

export interface UseWebSocketReturn {
  messages: Message[]
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  sendMessage: (content: string, communityId: string) => void
  sendTyping: (isTyping: boolean, communityId: string) => void
  typingUsers: string[]
  onlineUsers: string[]
  error: string | null
}

export function useWebSocket(userId: string): UseWebSocketReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    try {
      setConnectionStatus("connecting")
      setError(null)

      // In a real implementation, this would be your WebSocket server URL
      // For demo purposes, we'll simulate the connection
      ws.current = new WebSocket(`ws://localhost:3001/ws?userId=${userId}`)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        setConnectionStatus("connected")
        reconnectAttempts.current = 0

        // Send initial user data
        ws.current?.send(
          JSON.stringify({
            type: "user_connected",
            data: { userId },
          }),
        )
      }

      ws.current.onmessage = (event) => {
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data)

          switch (wsMessage.type) {
            case "message":
              setMessages((prev) => [
                ...prev,
                {
                  ...wsMessage.data,
                  timestamp: new Date(wsMessage.data.timestamp),
                },
              ])
              break

            case "typing":
              setTypingUsers((prev) => {
                if (wsMessage.data.isTyping) {
                  return [...prev.filter((user) => user !== wsMessage.data.userName), wsMessage.data.userName]
                } else {
                  return prev.filter((user) => user !== wsMessage.data.userName)
                }
              })
              break

            case "user_joined":
              setOnlineUsers((prev) => [
                ...prev.filter((user) => user !== wsMessage.data.userName),
                wsMessage.data.userName,
              ])
              break

            case "user_left":
              setOnlineUsers((prev) => prev.filter((user) => user !== wsMessage.data.userName))
              setTypingUsers((prev) => prev.filter((user) => user !== wsMessage.data.userName))
              break

            case "error":
              setError(wsMessage.data.message)
              break
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        setConnectionStatus("disconnected")

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, timeout)
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
        setError("Connection error occurred")
      }
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err)
      setConnectionStatus("error")
      setError("Failed to establish connection")
    }
  }, [userId])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (ws.current) {
      ws.current.close(1000, "User disconnected")
      ws.current = null
    }

    setConnectionStatus("disconnected")
  }, [])

  const sendMessage = useCallback(
    (content: string, communityId: string) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message = {
          type: "message",
          data: {
            id: Date.now().toString(),
            content,
            communityId,
            userId,
            timestamp: new Date().toISOString(),
          },
        }

        ws.current.send(JSON.stringify(message))
      } else {
        setError("Cannot send message: Not connected")
      }
    },
    [userId],
  )

  const sendTyping = useCallback(
    (isTyping: boolean, communityId: string) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "typing",
            data: {
              isTyping,
              communityId,
              userId,
            },
          }),
        )
      }
    },
    [userId],
  )

  useEffect(() => {
    // Simulate connection for demo purposes
    // In a real app, you would connect to your actual WebSocket server
    const simulateConnection = () => {
      setConnectionStatus("connected")

      // Simulate receiving messages
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          // 30% chance of receiving a message
          const simulatedMessage: Message = {
            id: Date.now().toString(),
            user: {
              name: ["Alice", "Bob", "Carol", "David"][Math.floor(Math.random() * 4)],
              avatar: "/placeholder.svg?height=32&width=32",
              isOnline: true,
            },
            content: [
              "Hello everyone!",
              "How is everyone doing?",
              "Just finished a great project!",
              "Anyone want to collaborate?",
              "Great discussion today!",
            ][Math.floor(Math.random() * 5)],
            timestamp: new Date(),
            communityId: "1",
          }

          setMessages((prev) => [...prev, simulatedMessage])
        }
      }, 5000)

      return () => clearInterval(interval)
    }

    const cleanup = simulateConnection()

    return () => {
      cleanup()
      disconnect()
    }
  }, [disconnect])

  return {
    messages,
    connectionStatus,
    sendMessage,
    sendTyping,
    typingUsers,
    onlineUsers,
    error,
  }
}
