"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react"

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected" | "error"
  error?: string | null
}

export function ConnectionStatus({ status, error }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: "Connected",
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
        }
      case "connecting":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Connecting...",
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600",
        }
      case "disconnected":
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: "Disconnected",
          variant: "destructive" as const,
          className: "",
        }
      case "error":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          text: "Error",
          variant: "destructive" as const,
          className: "",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 text-xs ${config.className}`}
      title={error || config.text}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.text}</span>
    </Badge>
  )
}
