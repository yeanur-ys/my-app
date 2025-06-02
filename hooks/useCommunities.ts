import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCommunities(userId: string | null) {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCommunities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("community_members")
      .select("communities(*)")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setCommunities(data?.map((row: any) => row.communities) || []);
        setLoading(false);
      });
  }, [userId]);

  return { communities, loading, error };
}
