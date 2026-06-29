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
import { XPProgressWidget } from "../widgets/XPProgressWidget";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface MemberDashboardWidgetGridProps {
  viewModel: MemberDashboardViewModel;
}

export function MemberDashboardWidgetGrid({ viewModel }: MemberDashboardWidgetGridProps) {
  return (
    <div className="space-y-6">
      {/* Hero row: three equal-height columns.
          `items-stretch` makes every column share the tallest column's height,
          which is naturally defined by column 1 (journal + consultation). */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Jurnal Terakhir (grows) + Butuh Teman Cerita */}
        <div className="flex flex-col gap-6">
          <div data-user-tour="user-journal" className="flex-1 flex flex-col">
            <QuickJournalWidget latestJournal={viewModel.latestJournal} isLoading={viewModel.isLoadingWidgets} />
          </div>
          <ConsultationPromoWidget />
        </div>

        {/* Column 2: Wawasan Mood (fills column height) */}
        <div data-user-tour="user-mood" className="flex flex-col">
          <MoodInsightWidget moods={viewModel.moodHistory} isLoading={viewModel.isLoadingWidgets} />
        </div>

        {/* Column 3: Perjalananmu + Guild Kamu (Guild fills remaining height) */}
        <div className="flex flex-col gap-6">
          <XPProgressWidget />
          <div className="flex-1 flex flex-col [&>*]:h-full">
            <GuildWidget />
          </div>
        </div>
      </div>

      {/* Secondary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-8 space-y-6">
          <MoodCalendar moods={viewModel.moodHistory} />
          <MusicPlayerWidget categories={viewModel.categories} />
        </div>

        <div className="md:col-span-4 space-y-6">
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
              <section className="rounded-2xl border border-dashed border-primary/20 bg-white/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Pernapasan</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Sesi napas siap dipakai</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">Buka halaman pernapasan untuk memulai latihan singkat saat butuh jeda.</p>
                <Button asChild size="sm" variant="outline" className="mt-3 border-primary/20 text-primary hover:bg-primary/10">
                  <Link href={ROUTES.BREATHING}>Mulai Pernapasan</Link>
                </Button>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
