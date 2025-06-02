import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Hash, Home } from "lucide-react";
import { DEFAULT_COMMUNITY_COLOR } from "@/constants/defaults";

export function CommunitySidebar({
  communities,
  selectedCommunity,
  onSelectCommunity,
  onSelectDashboard,
  showDashboard,
}: {
  communities: any[];
  selectedCommunity: any;
  onSelectCommunity: (community: any) => void;
  onSelectDashboard: () => void;
  showDashboard: boolean;
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    community.color && typeof community.color === "string"
                      ? community.color
                      : DEFAULT_COMMUNITY_COLOR
                  }`}
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
  );
}
