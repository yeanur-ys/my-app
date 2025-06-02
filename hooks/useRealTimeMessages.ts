import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useRealTimeMessages(communityId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages on load or community change
  useEffect(() => {
    if (!communityId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("messages")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setMessages(data || []);
        setLoading(false);
      });
  }, [communityId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!communityId) return;
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `community_id=eq.${communityId}` },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  const sendMessage = useCallback(
    async (content: string, userId: string) => {
      if (!communityId) return;
      await supabase.from("messages").insert({ community_id: communityId, user_id: userId, content });
    },
    [communityId]
  );

  return { messages, loading, error, sendMessage };
}
