import { ConsultationPromoWidget } from "../widgets/ConsultationPromoWidget";
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

        {/* Column 3: Perjalananmu */}
        <div className="flex flex-col gap-6">
          <XPProgressWidget />
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

        </div>
      </div>
    </div>
  );
}
