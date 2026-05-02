"use client";

import { MitraDashboardHeader } from "./mitra-dashboard/MitraDashboardHeader";
import { MitraInsightsSection } from "./mitra-dashboard/MitraInsightsSection";
import { MitraLoadingState } from "./mitra-dashboard/MitraLoadingState";
import { MitraNoOrganizationState } from "./mitra-dashboard/MitraNoOrganizationState";
import { MitraOrganizationsSection } from "./mitra-dashboard/MitraOrganizationsSection";
import { MitraOverviewSection } from "./mitra-dashboard/MitraOverviewSection";
import { MitraPaymentsSection } from "./mitra-dashboard/MitraPaymentsSection";
import { MitraSettingsSection } from "./mitra-dashboard/MitraSettingsSection";
import { MitraSubscriptionSection } from "./mitra-dashboard/MitraSubscriptionSection";
import { useMitraDashboardViewModel } from "./mitra-dashboard/useMitraDashboardViewModel";
import type { MitraDashboardSection } from "./mitra-dashboard-utils";

export type { MitraDashboardSection } from "./mitra-dashboard-utils";

interface MitraDashboardProps {
  initialSection?: MitraDashboardSection;
}

export function MitraDashboard({ initialSection = "overview" }: MitraDashboardProps) {
  const viewModel = useMitraDashboardViewModel(initialSection);

  if (viewModel.isLoading) {
    return <MitraLoadingState />;
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[112rem] space-y-6 bg-gradient-to-br from-gray-50 via-white to-red-50/40 p-3 xs:p-4 lg:p-6">
      <MitraDashboardHeader viewModel={viewModel} />

      {viewModel.errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {viewModel.errorMessage}
        </div>
      )}

      {!viewModel.hasOrganizations ? (
        <MitraNoOrganizationState viewModel={viewModel} />
      ) : initialSection === "organizations" ? (
        <MitraOrganizationsSection viewModel={viewModel} />
      ) : initialSection === "subscription" ? (
        <MitraSubscriptionSection viewModel={viewModel} />
      ) : initialSection === "insights" ? (
        <MitraInsightsSection viewModel={viewModel} />
      ) : initialSection === "payments" ? (
        <MitraPaymentsSection viewModel={viewModel} />
      ) : initialSection === "settings" ? (
        <MitraSettingsSection viewModel={viewModel} />
      ) : (
        <MitraOverviewSection viewModel={viewModel} />
      )}
    </div>
  );
}
