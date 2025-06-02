"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { Dashboard } from "@/components/Dashboard";
import { MessagesList } from "@/components/MessagesList";
import { ConnectionIndicator } from "@/components/ConnectionIndicator";
import { CommunitySidebar } from "@/components/CommunitySidebar";
import { MessageInput } from "@/components/MessageInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { ProfileSetup } from "@/components/ProfileSetup";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SchoolCommunityChat() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { communities, loading: communitiesLoading, error: communitiesError } = useCommunities(user?.id || null);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [profileSetupKey, setProfileSetupKey] = useState(0);
  const { messages, loading: messagesLoading, error: messagesError, sendMessage } =
    useRealTimeMessages(selectedCommunity?.id || null);

  useEffect(() => {
    if (communities.length > 0 && !selectedCommunity && !showDashboard) {
      setSelectedCommunity(communities[0]);
    }
  }, [communities, selectedCommunity, showDashboard]);

  useEffect(() => {
    if (!showDashboard && communities.length > 0) {
      setSelectedCommunity(communities[0]);
    }
  }, [showDashboard, communities]);

  const handleSendMessage = async (content: string) => {
    if (user && selectedCommunity) {
      try {
        setSendingMessage(true);
        await sendMessage(content, user.id);
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleSelectCommunity = (community: any) => {
    setSelectedCommunity(community);
    setShowDashboard(false);
  };

  const handleSelectDashboard = () => {
    setShowDashboard(true);
    setSelectedCommunity(null);
  };

  const handleProfileCreated = () => {
    setProfileSetupKey((prev) => prev + 1);
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (!profile) {
    return <ProfileSetup key={profileSetupKey} user={user} onProfileCreated={handleProfileCreated} />;
  }

  const totalMessages = (messages ?? []).filter((msg) => msg.user_id === user.id).length;

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
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              {/* SidebarTrigger, Title, etc. */}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserAvatarMenu profile={profile} signOut={signOut} />
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
  );
}
