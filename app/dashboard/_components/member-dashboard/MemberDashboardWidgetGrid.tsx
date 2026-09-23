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
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-6">
          <div data-user-tour="user-journal" className="flex-1 flex flex-col">
            <QuickJournalWidget latestJournal={viewModel.latestJournal} isLoading={viewModel.isLoadingWidgets} />
          </div>
          <ConsultationPromoWidget />
        </div>

        <div data-user-tour="user-mood" className="flex flex-col">
          <MoodInsightWidget moods={viewModel.moodHistory} isLoading={viewModel.isLoadingWidgets} />
        </div>

        <div className="grid content-start gap-6 sm:grid-cols-2 lg:col-span-2 xl:col-span-1 xl:grid-cols-1">
          <XPProgressWidget />
          <div data-user-tour="user-progress-map">
            <MapProgressWidget />
          </div>
        </div>
      </div>

      <MoodCalendar moods={viewModel.moodHistory} />

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <MusicPlayerWidget categories={viewModel.categories} />
        </div>

        <div className="md:col-span-4">
          <RecommendedArticlesWidget articles={viewModel.recommendedArticles} isLoading={viewModel.isLoadingWidgets} />
        </div>
      </div>
    </div>
  );
}
