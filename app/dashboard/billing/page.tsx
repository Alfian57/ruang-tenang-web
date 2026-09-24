"use client";

import dynamic from "next/dynamic";
import { Coins, CreditCard, ReceiptText } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabs, DashboardPanelLoading, type DashboardHubTab } from "@/components/shared/dashboard/DashboardHubTabs";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";
import { useQueryTab } from "@/hooks/useQueryTab";
import { ROUTES } from "@/lib/routes";

const BillingPanel = dynamic(() => import("./_components/BillingPanel"), { loading: () => <DashboardPanelLoading label="Memuat paket dan koin" /> });
const CoinsPanel = dynamic(() => import("./_components/CoinsPanel"), { loading: () => <DashboardPanelLoading label="Memuat paket dan koin" /> });

type BillingTab = "packages" | "coins" | "transactions";
const VALID_TABS = new Set<BillingTab>(["packages", "coins", "transactions"]);
const BILLING_TABS = [
  { value: "packages", label: "Paket", icon: CreditCard },
  { value: "coins", label: "Koin", icon: Coins },
  { value: "transactions", label: "Transaksi", icon: ReceiptText },
] as const satisfies readonly DashboardHubTab<BillingTab>[];

export default function BillingPage() {
  const { activeTab, setActiveTab } = useQueryTab({
    defaultTab: "packages" as BillingTab,
    validTabs: VALID_TABS,
    buildRoute: ROUTES.billingTab,
  });

  return (
    <div className="min-h-screen py-4 lg:py-6">
      <DashboardMascotHero
        eyebrow="Ruang untuk berkembang"
        title="Paket & Koin"
        description="Atur akses Premium, saldo koin, dan riwayat transaksi dengan lebih mudah."
        image="/images/landing/mascot/trophy.webp"
        imageAlt="RuNa merayakan setiap langkah dan pencapaianmu"
      />

      <DashboardHubTabs tabs={BILLING_TABS} value={activeTab} onValueChange={setActiveTab} compact>
        <TabsContent value="packages"><BillingPanel mode="packages" /></TabsContent>
        <TabsContent value="coins"><CoinsPanel /></TabsContent>
        <TabsContent value="transactions"><BillingPanel mode="transactions" /></TabsContent>
      </DashboardHubTabs>
    </div>
  );
}
