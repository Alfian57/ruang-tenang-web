"use client";

import { CrisisSupportModal } from "@/components/shared/moderation";
import { CrisisSupportSection } from "./member-dashboard/CrisisSupportSection";
import { MemberDashboardHeader } from "./member-dashboard/MemberDashboardHeader";
import { MemberDashboardWidgetGrid } from "./member-dashboard/MemberDashboardWidgetGrid";
import { NetworkDegradedBanner } from "./member-dashboard/NetworkDegradedBanner";
import { useMemberDashboardViewModel } from "./member-dashboard/useMemberDashboardViewModel";
import "./member-dashboard/member-dashboard.css";

export function MemberDashboard() {
  const viewModel = useMemberDashboardViewModel();

  return (
    <div className="member-dashboard w-full space-y-5 py-3 xs:py-4 lg:space-y-6 lg:py-6">
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
