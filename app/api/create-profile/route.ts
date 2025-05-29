import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Profile, Community, User } from "../types/entities";
import { DEFAULT_SCHOOL_NAME, DEFAULT_COMMUNITY_COLOR } from "../constants/defaults";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { userId, name, year, className, communityName, communityColor } = await req.json();

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: userId, name, year, class: className }])
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Optionally create community
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
}

const YourComponent = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // ...existing code...
  useEffect(() => {
    // When switching from dashboard to chat, reset selectedCommunity
    if (!showDashboard && communities.length > 0) {
      setSelectedCommunity(communities[0]);
    }
  }, [showDashboard, communities]);

  const handleProfileSubmit = async (formData: {
    name: string;
    year: number;
    class: string;
    communityName?: string;
    communityColor?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          year: formData.year,
          className: formData.class,
          communityName: formData.communityName || DEFAULT_SCHOOL_NAME,
          communityColor: formData.communityColor || DEFAULT_COMMUNITY_COLOR,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create profile");

      // Optionally update state with new profile/community
      setProfile(data.profile);
      if (data.community) setCommunities((prev) => [...prev, data.community]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...
};

export default YourComponent;
