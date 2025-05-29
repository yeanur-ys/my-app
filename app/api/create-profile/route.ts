import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const { userId, email, fullName, classNumber, graduationYear, schoolName } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create profile using admin client to bypass RLS
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: email || "",
      full_name: fullName || "New User",
      class_number: Number.parseInt(classNumber) || 1,
      graduation_year: Number.parseInt(graduationYear) || new Date().getFullYear() + 4,
      school_name: schoolName || "Default School",
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Create or get community
    const { data: existingCommunities } = await supabaseAdmin
      .from("communities")
      .select("id")
      .eq("class_number", Number.parseInt(classNumber) || 1)
      .eq("graduation_year", Number.parseInt(graduationYear) || new Date().getFullYear() + 4)
      .eq("school_name", schoolName || "Default School")

    let communityId = existingCommunities?.[0]?.id

    if (!communityId) {
      const communityName = `Class ${classNumber} - ${graduationYear}`
      const { data: newCommunities, error: communityError } = await supabaseAdmin
        .from("communities")
        .insert({
          name: communityName,
          description: `Community for Class ${classNumber} graduating in ${graduationYear}`,
          class_number: Number.parseInt(classNumber) || 1,
          graduation_year: Number.parseInt(graduationYear) || new Date().getFullYear() + 4,
          school_name: schoolName || "Default School",
          icon: "🎓",
          color: "bg-blue-500",
        })
        .select("id")

      if (communityError) {
        console.error("Community creation error:", communityError)
        return NextResponse.json({ error: communityError.message }, { status: 500 })
      }
      communityId = newCommunities?.[0]?.id
    }

    // Add user to community
    if (communityId) {
      const { error: memberError } = await supabaseAdmin.from("community_members").insert({
        user_id: userId,
        community_id: communityId,
      })

      if (memberError) {
        console.error("Membership creation error:", memberError)
        return NextResponse.json({ error: memberError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
