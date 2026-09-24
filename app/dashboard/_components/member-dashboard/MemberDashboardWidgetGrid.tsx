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
    <div className="space-y-5 lg:space-y-6">
      <div className="member-dashboard-section-intro">
        <div>
          <p className="member-dashboard-section-kicker">Ritme hari ini</p>
          <h2>Kenali perasaanmu, lanjutkan ceritamu.</h2>
        </div>
        <p>Dua langkah sederhana untuk memberi ruang pada dirimu.</p>
      </div>
      <div className="member-dashboard-today-grid">
        <div data-user-tour="user-mood" className="member-dashboard-mood-slot flex flex-col">
          <MoodInsightWidget moods={viewModel.moodHistory} isLoading={viewModel.isLoadingWidgets} />
        </div>
        <div data-user-tour="user-journal" className="member-dashboard-journal-slot flex flex-col">
          <QuickJournalWidget latestJournal={viewModel.latestJournal} isLoading={viewModel.isLoadingWidgets} />
        </div>
      </div>
      <div className="member-dashboard-section-intro">
        <div>
          <p className="member-dashboard-section-kicker">Terus bertumbuh</p>
          <h2>Setiap langkah kecil punya arti.</h2>
        </div>
      </div>
      <div className="member-dashboard-growth-grid">
        <div className="member-dashboard-xp-slot">
          <XPProgressWidget />
        </div>
        <div data-user-tour="user-progress-map" className="member-dashboard-map-slot"><MapProgressWidget /></div>
        <div className="member-dashboard-chat-slot"><ConsultationPromoWidget /></div>
      </div>
      <div className="member-dashboard-calendar-slot"><MoodCalendar moods={viewModel.moodHistory} /></div>
      <div className="member-dashboard-section-intro">
        <div>
          <p className="member-dashboard-section-kicker">Teman jeda</p>
          <h2>Isi ulang energi dengan caramu.</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="member-dashboard-music-slot lg:col-span-7">
          <MusicPlayerWidget categories={viewModel.categories} />
        </div>
        <div className="member-dashboard-articles-slot lg:col-span-5">
          <RecommendedArticlesWidget articles={viewModel.recommendedArticles} isLoading={viewModel.isLoadingWidgets} />
        </div>
      </div>
    </div>
  );
}
