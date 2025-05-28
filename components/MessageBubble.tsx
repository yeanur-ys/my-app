"use client"

import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

// Generate consistent avatar URLs
const generateAvatarUrl = (name: string, seed?: string) => {
  const seedValue = seed || name?.toLowerCase().replace(/\s+/g, "") || "default"
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

interface MessageBubbleProps {
  message: any
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <Card className="mb-4 border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={message.profiles?.avatar_url || generateAvatarUrl(message.profiles?.full_name)}
                alt={message.profiles?.full_name || "User"}
              />
              <AvatarFallback>{(message.profiles?.full_name || "U").charAt(0)}</AvatarFallback>
            </Avatar>
            {message.profiles?.is_online && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{message.profiles?.full_name || "Unknown User"}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Reply</DropdownMenuItem>
              <DropdownMenuItem>React</DropdownMenuItem>
              <DropdownMenuItem>Copy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
