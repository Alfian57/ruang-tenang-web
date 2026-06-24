"use client";

import { CrisisSupportModal } from "@/components/shared/moderation";
import { CrisisSupportSection } from "./member-dashboard/CrisisSupportSection";
import { MemberDashboardHeader } from "./member-dashboard/MemberDashboardHeader";
import { MemberDashboardWidgetGrid } from "./member-dashboard/MemberDashboardWidgetGrid";
import { NetworkDegradedBanner } from "./member-dashboard/NetworkDegradedBanner";
import { useMemberDashboardViewModel } from "./member-dashboard/useMemberDashboardViewModel";

export function MemberDashboard() {
  const viewModel = useMemberDashboardViewModel();

  return (
    <div className="mx-auto w-full max-w-[112rem] space-y-6 bg-gray-50/50 p-3 xs:p-4 lg:p-6">
      <MemberDashboardHeader viewModel={viewModel} />
      <NetworkDegradedBanner viewModel={viewModel} />

      <CrisisSupportSection viewModel={viewModel} />
      <MemberDashboardWidgetGrid viewModel={viewModel} />

      <CrisisSupportModal
        isOpen={viewModel.crisis.showCrisisSupport}
        onClose={() => viewModel.crisis.setShowCrisisSupport(false)}
      />
    </div>
  );
}
