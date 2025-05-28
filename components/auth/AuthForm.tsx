"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
    classNumber: "",
    graduationYear: "",
    schoolName: "Default School",
  })

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Attempting sign in...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      })

      if (error) {
        console.error("Sign in error:", error)
        throw error
      }

      console.log("Sign in successful:", data.user?.id)

      // Check if profile exists
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)

        if (profileError) {
          console.error("Error checking profile:", profileError)
        } else if (!profileData || profileData.length === 0) {
          console.log("No profile found, creating one...")

          // Create a basic profile
          const { error: createError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email || "",
            full_name: "New User",
            class_number: 1,
            graduation_year: new Date().getFullYear() + 4,
            school_name: "Default School",
          })

          if (createError) {
            console.error("Error creating profile:", createError)
          } else {
            console.log("Profile created successfully")
          }
        }
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Starting sign up process...")

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      })

      if (authError) {
        console.error("Auth error:", authError)
        throw authError
      }

      if (authData.user) {
        console.log("User created:", authData.user.id)

        // Check if profile already exists
        const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", authData.user.id)

        if (existingProfile && existingProfile.length > 0) {
          console.log("Profile already exists, skipping creation")
        } else {
          // Create profile
          console.log("Creating profile...")
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            email: signUpData.email,
            full_name: signUpData.fullName,
            class_number: Number.parseInt(signUpData.classNumber),
            graduation_year: Number.parseInt(signUpData.graduationYear),
            school_name: signUpData.schoolName,
          })

          if (profileError) {
            console.error("Profile creation error:", profileError)
            throw profileError
          }
          console.log("Profile created successfully")
        }

        // Create or get community for this class and year
        const communityName = `Class ${signUpData.classNumber} - ${signUpData.graduationYear}`
        console.log("Looking for community:", communityName)

        const { data: existingCommunity } = await supabase
          .from("communities")
          .select("id")
          .eq("class_number", Number.parseInt(signUpData.classNumber))
          .eq("graduation_year", Number.parseInt(signUpData.graduationYear))
          .eq("school_name", signUpData.schoolName)
          .single()

        let communityId = existingCommunity?.id

        if (!existingCommunity) {
          console.log("Creating new community...")
          // Create new community
          const { data: newCommunity, error: communityError } = await supabase
            .from("communities")
            .insert({
              name: communityName,
              description: `Community for Class ${signUpData.classNumber} graduating in ${signUpData.graduationYear}`,
              class_number: Number.parseInt(signUpData.classNumber),
              graduation_year: Number.parseInt(signUpData.graduationYear),
              school_name: signUpData.schoolName,
              icon: "🎓",
              color: "bg-blue-500",
            })
            .select("id")
            .single()

          if (communityError) {
            console.error("Community creation error:", communityError)
            throw communityError
          }
          communityId = newCommunity.id
          console.log("Community created:", communityId)
        } else {
          console.log("Using existing community:", communityId)
        }

        // Add user to community
        if (communityId) {
          console.log("Adding user to community...")

          // Check if membership already exists
          const { data: existingMembership } = await supabase
            .from("community_members")
            .select("id")
            .eq("user_id", authData.user.id)
            .eq("community_id", communityId)

          if (existingMembership && existingMembership.length > 0) {
            console.log("User already member of community")
          } else {
            const { error: memberError } = await supabase.from("community_members").insert({
              user_id: authData.user.id,
              community_id: communityId,
            })

            if (memberError) {
              console.error("Membership creation error:", memberError)
              throw memberError
            }
            console.log("User added to community successfully")
          }
        }

        setSuccess("Account created successfully! You can now sign in.")
      }
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message || "An error occurred during sign up")
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
          <CardTitle className="text-2xl font-bold">School Community Chat</CardTitle>
          <CardDescription>Connect with your classmates and school community</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select
                      value={signUpData.classNumber}
                      onValueChange={(value) => setSignUpData({ ...signUpData, classNumber: value })}
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
                      value={signUpData.graduationYear}
                      onValueChange={(value) => setSignUpData({ ...signUpData, graduationYear: value })}
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
                    value={signUpData.schoolName}
                    onChange={(e) => setSignUpData({ ...signUpData, schoolName: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
