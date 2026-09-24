"use client";

import dynamic from "next/dynamic";
import { Activity, Gift, Map } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabs, DashboardPanelLoading, type DashboardHubTab } from "@/components/shared/dashboard/DashboardHubTabs";
import { useQueryTab } from "@/hooks/useQueryTab";
import { ROUTES } from "@/lib/routes";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";

const SummaryPanel = dynamic(() => import("./_components/SummaryPanel"), { loading: () => <DashboardPanelLoading label="Memuat perjalanan" /> });
const MapPanel = dynamic(() => import("./_components/MapPanel"), { loading: () => <DashboardPanelLoading label="Memuat perjalanan" /> });
const RewardsPanel = dynamic(() => import("./_components/RewardsPanel"), { loading: () => <DashboardPanelLoading label="Memuat perjalanan" /> });

type JourneyTab = "summary" | "map" | "rewards";
const VALID_TABS = new Set<JourneyTab>(["summary", "map", "rewards"]);
const JOURNEY_TABS = [
  { value: "summary", label: "Ringkasan", icon: Activity },
  { value: "map", label: "Peta", icon: Map },
  { value: "rewards", label: "Hadiah", icon: Gift },
] as const satisfies readonly DashboardHubTab<JourneyTab>[];

export default function JourneyPage() {
  const { activeTab, setActiveTab } = useQueryTab({
    defaultTab: "summary" as JourneyTab,
    validTabs: VALID_TABS,
    buildRoute: ROUTES.journeyTab,
  });

  return (
    <div className="relative min-h-screen pb-7">
      <div className="relative mx-auto max-w-7xl">
        <DashboardMascotHero eyebrow="Setiap langkah berarti" title="Perjalananmu" description="Lihat sejauh mana kamu bertumbuh, jelajahi checkpoint baru, dan rayakan pencapaian kecil bersama Bulan Pulih." image="/images/landing/mascot/map.webp" imageAlt="Bulan Pulih menjelajahi peta perjalanan" />

        <DashboardHubTabs tabs={JOURNEY_TABS} value={activeTab} onValueChange={setActiveTab} tabListTourTarget="journey-tabs" compact className="mt-6">
          <TabsContent value="summary"><SummaryPanel /></TabsContent>
          <TabsContent value="map"><MapPanel /></TabsContent>
          <TabsContent value="rewards"><RewardsPanel /></TabsContent>
        </DashboardHubTabs>
      </div>
    </div>
  );
}
