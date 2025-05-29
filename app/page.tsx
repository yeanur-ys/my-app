"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Hash, Send, Settings, Users, Moon, Sun, Smile, LogOut, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { AuthForm } from "@/components/auth/AuthForm"
import { Dashboard } from "@/components/Dashboard"
import { MessagesList } from "@/components/MessagesList"
import { ConnectionIndicator } from "@/components/ConnectionIndicator"
import { useAuth } from "@/hooks/useAuth"
import { useCommunities } from "@/hooks/useCommunities"
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages"
import { Loader2 } from "lucide-react"

// Generate consistent avatar URLs
const generateAvatarUrl = (name: string, seed?: string) => {
  const seedValue = seed || name?.toLowerCase().replace(/\s+/g, "") || "default"
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function CommunitySidebar({
  communities,
  selectedCommunity,
  onSelectCommunity,
  onSelectDashboard,
  showDashboard,
}: {
  communities: any[]
  selectedCommunity: any
  onSelectCommunity: (community: any) => void
  onSelectDashboard: () => void
  showDashboard: boolean
}) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hash className="h-4 w-4" />
          </div>
          <span className="font-semibold">School Chat</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onSelectDashboard}
              isActive={showDashboard}
              className="h-12 justify-start gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                <Home className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">Dashboard</span>
                <span className="text-xs text-muted-foreground">Overview & stats</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {communities.map((community) => (
            <SidebarMenuItem key={community.id}>
              <SidebarMenuButton
                onClick={() => onSelectCommunity(community)}
                isActive={!showDashboard && selectedCommunity?.id === community.id}
                className="h-12 justify-start gap-3"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${community.color} text-white text-sm font-medium`}
                >
                  {community.icon}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{community.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Class {community.class_number} • {community.graduation_year}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          Communities are automatically assigned based on your class and graduation year
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function MessageInput({
  onSendMessage,
  disabled,
  loading,
}: {
  onSendMessage: (content: string) => void
  disabled: boolean
  loading: boolean
}) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim() && !disabled && !loading) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="pr-10 resize-none"
            disabled={disabled || loading}
          />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6">
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleSend} size="icon" disabled={!message.trim() || disabled || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

// Profile Setup Component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

function ProfileSetup({ user, onProfileCreated }: { user: any; onProfileCreated: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    fullName: user.user_metadata?.full_name || "",
    classNumber: user.user_metadata?.class_number || "",
    graduationYear: user.user_metadata?.graduation_year || "",
    schoolName: user.user_metadata?.school_name || "Default School",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create profile using regular client (user should be authenticated)
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email || "",
        full_name: profileData.fullName,
        class_number: Number.parseInt(profileData.classNumber),
        graduation_year: Number.parseInt(profileData.graduationYear),
        school_name: profileData.schoolName,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw profileError
      }

      // Create or get community
      const { data: existingCommunities } = await supabase
        .from("communities")
        .select("id")
        .eq("class_number", Number.parseInt(profileData.classNumber))
        .eq("graduation_year", Number.parseInt(profileData.graduationYear))
        .eq("school_name", profileData.schoolName)

      let communityId = existingCommunities?.[0]?.id

      if (!communityId) {
        const communityName = `Class ${profileData.classNumber} - ${profileData.graduationYear}`
        const { data: newCommunities, error: communityError } = await supabase
          .from("communities")
          .insert({
            name: communityName,
            description: `Community for Class ${profileData.classNumber} graduating in ${profileData.graduationYear}`,
            class_number: Number.parseInt(profileData.classNumber),
            graduation_year: Number.parseInt(profileData.graduationYear),
            school_name: profileData.schoolName,
            icon: "🎓",
            color: "bg-blue-500",
          })
          .select("id")

        if (communityError) {
          console.error("Community creation error:", communityError)
          throw communityError
        }
        communityId = newCommunities?.[0]?.id
      }

      // Add user to community
      if (communityId) {
        const { error: memberError } = await supabase.from("community_members").insert({
          user_id: user.id,
          community_id: communityId,
        })

        if (memberError) {
          console.error("Membership creation error:", memberError)
          throw memberError
        }
      }

      onProfileCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)
  const classes = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Set up your profile to join your school community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={profileData.classNumber}
                  onValueChange={(value) => setProfileData({ ...profileData, classNumber: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classNum) => (
                      <SelectItem key={classNum} value={classNum.toString()}>
                        Class {classNum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Graduation Year</Label>
                <Select
                  value={profileData.graduationYear}
                  onValueChange={(value) => setProfileData({ ...profileData, graduationYear: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School Name</Label>
              <Input
                id="school"
                type="text"
                placeholder="Enter your school name"
                value={profileData.schoolName}
                onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </form>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SchoolCommunityChat() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { communities, loading: communitiesLoading, error: communitiesError } = useCommunities(user?.id || null)
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [showDashboard, setShowDashboard] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [profileSetupKey, setProfileSetupKey] = useState(0)
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useRealTimeMessages(selectedCommunity?.id || null)

  // Auto-select first community when communities load
  useEffect(() => {
    if (communities.length > 0 && !selectedCommunity && !showDashboard) {
      setSelectedCommunity(communities[0])
    }
  }, [communities, selectedCommunity, showDashboard])

  const handleSendMessage = async (content: string) => {
    if (user && selectedCommunity) {
      try {
        setSendingMessage(true)
        await sendMessage(content, user.id)
      } catch (error) {
        console.error("Failed to send message:", error)
      } finally {
        setSendingMessage(false)
      }
    }
  }

  const handleSelectCommunity = (community: any) => {
    setSelectedCommunity(community)
    setShowDashboard(false)
  }

  const handleSelectDashboard = () => {
    setShowDashboard(true)
    setSelectedCommunity(null)
  }

  const handleProfileCreated = () => {
    setProfileSetupKey((prev) => prev + 1)
    // Force a refresh of the auth state
    window.location.reload()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  // Show profile setup if user exists but no profile
  if (!profile) {
    return <ProfileSetup key={profileSetupKey} user={user} onProfileCreated={handleProfileCreated} />
  }

  // Calculate total messages sent by user
  const totalMessages = messages.filter((msg) => msg.user_id === user.id).length

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <CommunitySidebar
          communities={communities}
          selectedCommunity={selectedCommunity}
          onSelectCommunity={handleSelectCommunity}
          onSelectDashboard={handleSelectDashboard}
          showDashboard={showDashboard}
        />

        <SidebarInset className="flex flex-col">
          {/* Top Navigation */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              {showDashboard ? (
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-500" />
                  <h1 className="font-semibold">Dashboard</h1>
                </div>
              ) : selectedCommunity ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded ${selectedCommunity.color} text-white text-xs`}
                  >
                    {selectedCommunity.icon}
                  </div>
                  <h1 className="font-semibold">{selectedCommunity.name}</h1>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Class {selectedCommunity.class_number}
                  </Badge>
                  <ConnectionIndicator isConnected={!messagesError && !messagesLoading} isLoading={messagesLoading} />
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profile.avatar_url || generateAvatarUrl(profile.full_name)}
                        alt={profile.full_name || "User"}
                      />
                      <AvatarFallback>{(profile.full_name || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {showDashboard ? (
              <Dashboard profile={profile} communities={communities} totalMessages={totalMessages} />
            ) : selectedCommunity ? (
              <div className="p-4 space-y-0">
                {communitiesError && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertDescription>Error loading communities: {communitiesError}</AlertDescription>
                  </Alert>
                )}
                {messagesError && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertDescription>Error loading messages: {messagesError}</AlertDescription>
                  </Alert>
                )}
                <MessagesList messages={messages || []} loading={messagesLoading} error={messagesError} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a community to start chatting</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedCommunity && !showDashboard && (
            <MessageInput onSendMessage={handleSendMessage} disabled={!selectedCommunity} loading={sendingMessage} />
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
