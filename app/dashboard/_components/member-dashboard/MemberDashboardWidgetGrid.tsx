import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { BreathingWidget } from "@/app/dashboard/breathing/_components";
import { ConsultationPromoWidget } from "../widgets/ConsultationPromoWidget";
import { GuildWidget } from "../widgets/GuildWidget";
import { MapProgressWidget } from "../widgets/MapProgressWidget";
import { MoodCalendar } from "../widgets/MoodCalendar";
import { MoodInsightWidget } from "../widgets/MoodInsightWidget";
import { MusicPlayerWidget } from "../widgets/MusicPlayerWidget";
import { QuickJournalWidget } from "../widgets/QuickJournalWidget";
import { RecommendedArticlesWidget } from "../widgets/RecommendedArticlesWidget";
import { StoryOfTheWeekWidget } from "../widgets/StoryOfTheWeekWidget";
import { XPProgressWidget } from "../widgets/XPProgressWidget";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface MemberDashboardWidgetGridProps {
  viewModel: MemberDashboardViewModel;
}

export function MemberDashboardWidgetGrid({ viewModel }: MemberDashboardWidgetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div data-user-tour="user-journal">
              <QuickJournalWidget latestJournal={viewModel.latestJournal} isLoading={viewModel.isLoadingWidgets} />
            </div>

            <div className="hidden md:block">
              <ConsultationPromoWidget />
            </div>
          </div>
          <div className="h-full">
            <div data-user-tour="user-mood">
              <MoodInsightWidget moods={viewModel.moodHistory} isLoading={viewModel.isLoadingWidgets} activitySignals={viewModel.widgets.moodActivitySignals} />
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <ConsultationPromoWidget />
        </div>

        <MoodCalendar moods={viewModel.moodHistory} />
        <MusicPlayerWidget categories={viewModel.categories} />
      </div>

      <div className="md:col-span-4 space-y-6">
        <XPProgressWidget />
        <GuildWidget />

        <div data-user-tour="user-progress-map">
          <MapProgressWidget />
        </div>

        <RecommendedArticlesWidget articles={viewModel.recommendedArticles} isLoading={viewModel.isLoadingWidgets} />

        <div data-user-tour="user-breathing">
          {viewModel.breathingWidgetData ? (
            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
              <BreathingWidget data={viewModel.breathingWidgetData} />
            </div>
          ) : (
            <section className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Breathing</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">Sesi napas siap dipakai</p>
              <p className="mt-1 text-xs leading-5 text-gray-600">Buka halaman breathing untuk memulai latihan singkat saat butuh jeda.</p>
              <Button asChild size="sm" variant="outline" className="mt-3 border-sky-200 text-sky-700 hover:bg-sky-50">
                <Link href={ROUTES.BREATHING}>Mulai Breathing</Link>
              </Button>
            </section>
          )}
        </div>

        <section className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Eksplorasi Opsional</p>
          <div className="mt-3">
            <StoryOfTheWeekWidget />
          </div>
        </section>
      </div>
    </div>
  );
}
