"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

interface ConnectionIndicatorProps {
  isConnected: boolean
  isLoading: boolean
}

export function ConnectionIndicator({ isConnected, isLoading }: ConnectionIndicatorProps) {
  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className={`flex items-center gap-1 text-xs ${isConnected ? "bg-green-500 hover:bg-green-600" : ""}`}
    >
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      <span className="hidden sm:inline">{isConnected ? "Live" : "Offline"}</span>
    </Badge>
  )
}
