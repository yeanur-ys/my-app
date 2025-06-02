import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, year, classNumber, communityName, communityColor } = body;

    if (!userId || !name || !year || !classNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, name, year, class_number: classNumber }])
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Optionally create a community
    let community = null;
    if (communityName) {
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .insert([{ name: communityName, color: communityColor, owner_id: userId }])
        .select()
        .single();

      if (communityError) {
        return NextResponse.json({ error: communityError.message }, { status: 400 });
      }
      community = communityData;
    }

    return NextResponse.json({ profile, community });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
