"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageCircle, Calendar, GraduationCap } from "lucide-react"
import type { Profile, Community, User } from "../types/entities"
import ErrorMessage from "../components/ErrorMessage"
import { DEFAULT_SCHOOL_NAME, DEFAULT_COMMUNITY_COLOR } from "../constants/defaults"
import { useEffect, useState } from "react"

interface DashboardProps {
  profile: any
  communities: any[]
  totalMessages: number
}

// Generate consistent avatar URLs based on name
const generateAvatarUrl = (name: string, seed?: string) => {
  const seedValue = seed || name?.toLowerCase().replace(/\s+/g, "") || "default"
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}&backgroundColor=b`

export function Dashboard({ profile, communities, totalMessages }: DashboardProps) {
  const currentYear = new Date().getFullYear()
  const yearsUntilGraduation = profile?.graduation_year - currentYear
  const hasGraduated = yearsUntilGraduation <= 0

  useEffect(() => {
    if (!showDashboard && communities.length > 0) {
      setSelectedCommunity(communities[0]);
    }
  }, [showDashboard, communities]);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={profile?.avatar_url || generateAvatarUrl(profile?.full_name)}
            alt={profile?.full_name || "User"}
          />
          <AvatarFallback className="text-lg">{(profile?.full_name || "U").charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || "Student"}! 👋</h1>
          <p className="text-muted-foreground">
            Class {profile?.class_number} • {profile?.school_name}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={hasGraduated ? "secondary" : "default"}>
              <GraduationCap className="h-3 w-3 mr-1" />
              {hasGraduated ? `Graduated ${profile?.graduation_year}` : `Graduating ${profile?.graduation_year}`}
            </Badge>
            {!hasGraduated && yearsUntilGraduation > 0 && (
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {yearsUntilGraduation} year{yearsUntilGraduation !== 1 ? "s" : ""} to go
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Communities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communities.length}</div>
            <p className="text-xs text-muted-foreground">Active class communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">Total messages in all communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Year</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Class {profile?.class_number}</div>
            <p className="text-xs text-muted-foreground">{profile?.graduation_year} graduation year</p>
          </CardContent>
        </Card>
      </div>

      {/* Communities Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Communities</CardTitle>
          <CardDescription>Communities you're part of based on your class and graduation year</CardDescription>
        </CardHeader>
        <CardContent>
          {communities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No communities found</p>
              <p className="text-sm">Communities are automatically created when you sign up</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communities.map((community) => (
                <div
                  key={community.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${community.color} text-white text-lg`}
                  >
                    {community.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{community.name}</h3>
                    <p className="text-sm text-muted-foreground">{community.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Class {community.class_number}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {community.graduation_year}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Tips for using the school community chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
            <div>
              <p className="font-medium">Join Conversations</p>
              <p className="text-sm text-muted-foreground">
                Click on any community to start chatting with your classmates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium">Real-time Messaging</p>
              <p className="text-sm text-muted-foreground">Messages appear instantly for all community members</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
            <div>
              <p className="font-medium">Automatic Communities</p>
              <p className="text-sm text-muted-foreground">
                You're automatically added to communities based on your class and graduation year
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ErrorMessage message={error} />
    </div>
  )
}
