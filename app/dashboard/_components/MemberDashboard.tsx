"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar } from "lucide-react";
import { BreathingWidget } from "@/app/dashboard/breathing/_components";
import { useMemberDashboard } from "../_hooks/useMemberDashboard";
import { MoodCalendar } from "./widgets/MoodCalendar";
import { QuickJournalWidget } from "./widgets/QuickJournalWidget";
import { MoodInsightWidget } from "./widgets/MoodInsightWidget";
import { RecommendedArticlesWidget } from "./widgets/RecommendedArticlesWidget";
import { ConsultationPromoWidget } from "./widgets/ConsultationPromoWidget";
import { MusicPlayerWidget } from "./widgets/MusicPlayerWidget";

export function MemberDashboard() {
  const {
    user,
    moodHistory,
    categories,
    latestJournal,
    recommendedArticles,
    isLoadingWidgets,
    breathingWidgetData,
  } = useMemberDashboard();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-8">

      {/* 1. Welcoming Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
             Halo, <span className="text-primary">{user?.name?.split(" ")[0] || "Teman"}!</span> 👋
           </h1>
           <p className="text-gray-500 mt-1 text-lg">
             Bagaimana perasaanmu hari ini? Luangkan waktu sejenak untuk dirimu.
           </p>
        </div>
        <div className="flex items-center gap-3">
            <Link href={ROUTES.JOURNAL}>
                <Button variant="outline" className="rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors gap-2">
                   <Calendar className="w-4 h-4" />
                   Tulis Jurnal
                </Button>
            </Link>
            <Link href={ROUTES.CHAT}>
                <Button className="rounded-full shadow-lg hover:shadow-xl transition-all gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border-0">
                    <Sparkles className="w-4 h-4" />
                    Teman Cerita AI
                </Button>
            </Link>
        </div>
      </div>

      {/* 2. Main Dashboard Grid (Bento Box Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left Column: Widgets & Mood Calendar */}
        <div className="md:col-span-8 space-y-6">

            {/* Top Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-full">
                    <QuickJournalWidget latestJournal={latestJournal} isLoading={isLoadingWidgets} />
                </div>
                <div className="h-full">
                    <MoodInsightWidget moods={moodHistory} isLoading={isLoadingWidgets} />
                </div>
            </div>

            {/* Consultation Promo */}
            <ConsultationPromoWidget />

            {/* Mood Calendar Section */}
            <MoodCalendar moods={moodHistory} />
        </div>

        {/* Right Column: Widgets */}
        <div className="md:col-span-4 space-y-6">
             {/* Recommended Articles */}
             <RecommendedArticlesWidget articles={recommendedArticles} isLoading={isLoadingWidgets} />

            {/* Breathing Widget */}
            {breathingWidgetData && (
                <div className="transform hover:scale-[1.02] transition-transform duration-300">
                    <BreathingWidget data={breathingWidgetData} />
                </div>
            )}

            {/* Music Player Widget */}
            <MusicPlayerWidget categories={categories} />
        </div>
      </div>
    </div>
  );
}
