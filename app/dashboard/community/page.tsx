"use client";

import dynamic from "next/dynamic";
import { BarChart3, BookHeart, MessageSquareText, Star } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabs, DashboardPanelLoading, type DashboardHubTab } from "@/components/shared/dashboard/DashboardHubTabs";
import { useQueryTab } from "@/hooks/useQueryTab";
import { ROUTES } from "@/lib/routes";

const ForumPanel = dynamic(() => import("./_components/ForumPanel"), {
  loading: () => <DashboardPanelLoading label="Memuat konten komunitas" />,
});
const StoriesPanel = dynamic(() => import("./_components/StoriesPanel"), {
  loading: () => <DashboardPanelLoading label="Memuat konten komunitas" />,
});
const JournalCommunityPanel = dynamic(() => import("./_components/JournalCommunityPanel"), {
  loading: () => <DashboardPanelLoading label="Memuat konten komunitas" />,
});
const CommunityStatsPanel = dynamic(() => import("./_components/CommunityStatsPanel"), {
  loading: () => <DashboardPanelLoading label="Memuat konten komunitas" />,
});

type CommunityTab = "forum" | "stories" | "journals" | "stats";
const VALID_TABS = new Set<CommunityTab>(["forum", "stories", "journals", "stats"]);
const COMMUNITY_TABS = [
  { value: "forum", label: "Forum", icon: MessageSquareText },
  { value: "stories", label: "Kisah Inspiratif", icon: Star },
  { value: "journals", label: "Jurnal Publik", icon: BookHeart },
  { value: "stats", label: "Statistik", icon: BarChart3 },
] as const satisfies readonly DashboardHubTab<CommunityTab>[];

export default function CommunityPage() {
  const { activeTab, setActiveTab } = useQueryTab({
    defaultTab: "forum" as CommunityTab,
    validTabs: VALID_TABS,
    buildRoute: ROUTES.communityTab,
  });

  return (
    <div className="min-h-screen">
      <div className="pt-4 lg:pt-6">
        <h1 className="text-2xl font-bold text-gray-900">Komunitas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Berdiskusi, berbagi kisah, membaca jurnal publik, dan melihat dampak komunitas.
        </p>

        <DashboardHubTabs tabs={COMMUNITY_TABS} value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsContent value="forum"><ForumPanel /></TabsContent>
          <TabsContent value="stories"><StoriesPanel /></TabsContent>
          <TabsContent value="journals"><JournalCommunityPanel /></TabsContent>
          <TabsContent value="stats"><CommunityStatsPanel /></TabsContent>
        </DashboardHubTabs>
      </div>
    </div>
  );
}
