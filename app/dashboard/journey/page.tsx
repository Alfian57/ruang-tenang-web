"use client";

import dynamic from "next/dynamic";
import { Activity, Gift, Map } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabs, DashboardPanelLoading, type DashboardHubTab } from "@/components/shared/dashboard/DashboardHubTabs";
import { useQueryTab } from "@/hooks/useQueryTab";
import { ROUTES } from "@/lib/routes";

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
    <div className="relative min-h-screen py-5 lg:py-7">
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Perjalanan</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
            Lihat pertumbuhanmu, jelajahi setiap checkpoint, dan gunakan koin untuk hadiah yang membuat perjalanan makin personal.
          </p>
        </div>

        <DashboardHubTabs tabs={JOURNEY_TABS} value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsContent value="summary"><SummaryPanel /></TabsContent>
          <TabsContent value="map"><MapPanel /></TabsContent>
          <TabsContent value="rewards"><RewardsPanel /></TabsContent>
        </DashboardHubTabs>
      </div>
    </div>
  );
}
