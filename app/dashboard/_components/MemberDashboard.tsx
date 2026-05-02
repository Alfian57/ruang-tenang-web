"use client";

import { CrisisSupportModal } from "@/components/shared/moderation";
import { CrisisSupportSection } from "./member-dashboard/CrisisSupportSection";
import { DailyQuestSection } from "./member-dashboard/DailyQuestSection";
import { JourneyMapSection } from "./member-dashboard/JourneyMapSection";
import { MemberDashboardHeader } from "./member-dashboard/MemberDashboardHeader";
import { MemberDashboardWidgetGrid } from "./member-dashboard/MemberDashboardWidgetGrid";
import { NeedNowSection } from "./member-dashboard/NeedNowSection";
import { NetworkDegradedBanner } from "./member-dashboard/NetworkDegradedBanner";
import { SignatureLoopSection } from "./member-dashboard/SignatureLoopSection";
import { useMemberDashboardViewModel } from "./member-dashboard/useMemberDashboardViewModel";
import { WeeklyInsightSection } from "./member-dashboard/WeeklyInsightSection";
import { WeeklyStorylineSection } from "./member-dashboard/WeeklyStorylineSection";
import { WellnessPlanSection } from "./member-dashboard/WellnessPlanSection";

export function MemberDashboard() {
  const viewModel = useMemberDashboardViewModel();

  return (
    <div className="mx-auto w-full max-w-[112rem] space-y-6 bg-gray-50/50 p-3 xs:p-4 lg:p-6">
      <MemberDashboardHeader viewModel={viewModel} />
      <DailyQuestSection viewModel={viewModel} />
      <NetworkDegradedBanner viewModel={viewModel} />
      <WellnessPlanSection viewModel={viewModel} />
      <NeedNowSection viewModel={viewModel} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <WeeklyInsightSection viewModel={viewModel} />
        <JourneyMapSection viewModel={viewModel} />
      </div>

      <CrisisSupportSection viewModel={viewModel} />
      <SignatureLoopSection viewModel={viewModel} />
      <WeeklyStorylineSection viewModel={viewModel} />
      <MemberDashboardWidgetGrid viewModel={viewModel} />

      <CrisisSupportModal
        isOpen={viewModel.crisis.showCrisisSupport}
        onClose={() => viewModel.crisis.setShowCrisisSupport(false)}
      />
    </div>
  );
}
