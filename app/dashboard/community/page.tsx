"use client";

import dynamic from "next/dynamic";
import { BarChart3, BookHeart, MessageSquareText, Plus } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabList, DashboardPanelLoading, type DashboardHubTab } from "@/components/shared/dashboard/DashboardHubTabs";
import { Button } from "@/components/ui/button";
import { useQueryTab } from "@/hooks/useQueryTab";
import { ROUTES } from "@/lib/routes";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";
import { useForumPage } from "@/app/dashboard/forum/_hooks/useForumPage";

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
  { value: "stories", label: "Kisah Inspiratif", icon: BookHeart },
  { value: "journals", label: "Jurnal Publik", icon: BookHeart },
  { value: "stats", label: "Statistik", icon: BarChart3 },
] as const satisfies readonly DashboardHubTab<CommunityTab>[];

export default function CommunityPage() {
  const { activeTab, setActiveTab } = useQueryTab({
    defaultTab: "forum" as CommunityTab,
    validTabs: VALID_TABS,
    buildRoute: ROUTES.communityTab,
  });
  const forumPage = useForumPage({ enabled: activeTab === "forum" });

  return (
    <div className="min-h-screen">
      <div>
        <DashboardMascotHero eyebrow="Ruang untuk saling mendengar" title="Komunitas" description="Cerita kecilmu mungkin menjadi pelukan yang dibutuhkan orang lain. Jelajahi obrolan, kisah, dan refleksi bersama." image="/images/landing/mascot/community.webp" imageAlt="Bulan Pulih menyapa komunitas" />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CommunityTab)} className="mt-6 min-w-0">
          <div data-user-tour="community-actions" className="flex min-w-0 flex-wrap items-center gap-3">
            <DashboardHubTabList tabs={COMMUNITY_TABS} className="mb-0" />
            {activeTab === "forum" && (
              <Button
                onClick={() => forumPage.setIsCreateOpen(true)}
                disabled={forumPage.isForumBlocked}
                className="gradient-primary h-10 shrink-0 rounded-xl px-4 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                {forumPage.isForumBlocked ? "Forum diblokir" : "Buat Topik"}
              </Button>
            )}
          </div>

          <TabsContent value="forum"><ForumPanel forumPage={forumPage} /></TabsContent>
          <TabsContent value="stories"><StoriesPanel /></TabsContent>
          <TabsContent value="journals"><JournalCommunityPanel /></TabsContent>
          <TabsContent value="stats"><CommunityStatsPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
