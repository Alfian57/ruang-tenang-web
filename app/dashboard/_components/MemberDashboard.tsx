"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Calendar,
  Compass,
  Gift,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { BreathingWidget } from "@/app/dashboard/breathing/_components";
import { useMemberDashboard } from "../_hooks/useMemberDashboard";
import { MoodCalendar } from "./widgets/MoodCalendar";
import { QuickJournalWidget } from "./widgets/QuickJournalWidget";
import { MoodInsightWidget } from "./widgets/MoodInsightWidget";
import { RecommendedArticlesWidget } from "./widgets/RecommendedArticlesWidget";
import { ConsultationPromoWidget } from "./widgets/ConsultationPromoWidget";
import { MusicPlayerWidget } from "./widgets/MusicPlayerWidget";
import { StoryOfTheWeekWidget } from "./widgets/StoryOfTheWeekWidget";
import { XPProgressWidget } from "./widgets/XPProgressWidget";
import { GuildWidget } from "./widgets/GuildWidget";
import { MapProgressWidget } from "./widgets/MapProgressWidget";
import { useTheme } from "@/hooks/useTheme";

export function MemberDashboard() {
  const {
    user,
    moodHistory,
    categories,
    recentJournals,
    chatSessions,
    latestJournal,
    recommendedArticles,
    isLoadingWidgets,
    breathingWidgetData,
    isNetworkDegraded,
    lastSyncAt,
    refreshDashboardData,
  } = useMemberDashboard();

  const { exclusivity, themeKey } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const hasJournalToday = latestJournal
    ? new Date(latestJournal.created_at).toDateString() === new Date().toDateString()
    : false;

  const nextBestAction = hasJournalToday
    ? {
      title: "Lanjutkan refleksi lewat Teman Cerita AI",
      description: "Jurnal hari ini sudah tercatat. Saatnya lanjutkan obrolan singkat untuk merapikan pikiranmu.",
      href: ROUTES.CHAT,
      cta: "Lanjut ke Chat",
    }
    : {
      title: "Mulai langkah hari ini dengan jurnal 3 menit",
      description: "Satu catatan singkat akan membantu mood insight dan rekomendasi harianmu jadi lebih personal.",
      href: ROUTES.JOURNAL,
      cta: "Mulai Jurnal",
    };

  const loopStages = [
    {
      key: "reflect",
      title: "Refleksi",
      detail: "Mood check-in + jurnal ringkas",
      href: ROUTES.JOURNAL,
      icon: BookOpenCheck,
      completed: hasJournalToday || moodHistory.length > 0,
    },
    {
      key: "progress",
      title: "Progres",
      detail: "Task harian mendorong perjalananmu",
      href: ROUTES.PROGRESS_MAP,
      icon: Compass,
      completed: (user?.exp ?? 0) >= 300,
    },
    {
      key: "reward",
      title: "Reward",
      detail: "Klaim hadiah yang mengubah atmosfer",
      href: ROUTES.REWARDS,
      icon: Gift,
      completed: Boolean(user?.profile_theme && user.profile_theme !== "default"),
    },
    {
      key: "community",
      title: "Komunitas",
      detail: "Mission dan diskusi menjaga momentum",
      href: ROUTES.DASHBOARD_COMMUNITY,
      icon: Users,
      completed: (user?.exp ?? 0) >= 1000,
    },
  ];

  const moodActivitySignals = [
    {
      key: "journal",
      label: "Jurnal",
      count: hasJournalToday ? 1 : 0,
      href: ROUTES.JOURNAL,
    },
    {
      key: "breathing",
      label: "Pernafasan",
      count: breathingWidgetData?.today_sessions ?? 0,
      href: ROUTES.BREATHING,
    },
    {
      key: "article",
      label: "Baca Artikel",
      count: recommendedArticles.length > 0 ? 1 : 0,
      href: ROUTES.ARTICLES,
    },
    {
      key: "community",
      label: "Komunitas",
      count: (user?.exp ?? 0) >= 1000 ? 1 : 0,
      href: ROUTES.DASHBOARD_COMMUNITY,
    },
  ];

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const isWithinLast7Days = (timestamp?: string) => {
    if (!timestamp) return false;
    const time = new Date(timestamp).getTime();
    return Number.isFinite(time) && time >= sevenDaysAgo;
  };

  const journalsThisWeek = recentJournals.filter((journal) => isWithinLast7Days(journal.created_at)).length;
  const moodCheckinsThisWeek = moodHistory.filter((mood) => isWithinLast7Days(mood.created_at)).length;
  const chatSessionsThisWeek = chatSessions.filter((session) => !session.is_trash && isWithinLast7Days(session.updated_at)).length;
  const breathingSessionsToday = breathingWidgetData?.today_sessions ?? 0;
  const articleSignalsToday = recommendedArticles.length > 0 ? 1 : 0;

  const crossFeatureSignals = [
    {
      key: "journals",
      label: "Jurnal",
      count: journalsThisWeek,
      target: 3,
      windowLabel: "7 hari",
      href: ROUTES.JOURNAL,
    },
    {
      key: "mood",
      label: "Mood Check-in",
      count: moodCheckinsThisWeek,
      target: 4,
      windowLabel: "7 hari",
      href: ROUTES.MOOD_TRACKER,
    },
    {
      key: "chat",
      label: "Chat Reflektif",
      count: chatSessionsThisWeek,
      target: 3,
      windowLabel: "7 hari",
      href: ROUTES.CHAT,
    },
    {
      key: "breathing",
      label: "Sesi Napas",
      count: breathingSessionsToday,
      target: 1,
      windowLabel: "hari ini",
      href: ROUTES.BREATHING,
    },
    {
      key: "articles",
      label: "Artikel",
      count: articleSignalsToday,
      target: 1,
      windowLabel: "hari ini",
      href: ROUTES.ARTICLES,
    },
  ];

  const crossFeatureCompletion = Math.round(
    (crossFeatureSignals.reduce((total, signal) => total + Math.min(signal.count / signal.target, 1), 0)
      / crossFeatureSignals.length)
    * 100
  );

  const strongestSignal = [...crossFeatureSignals].sort(
    (a, b) => (b.count / b.target) - (a.count / a.target)
  )[0];

  const weakestSignal = [...crossFeatureSignals].sort(
    (a, b) => (a.count / a.target) - (b.count / b.target)
  )[0];

  const weeklyCrossFeatureNarrative = crossFeatureCompletion >= 80
    ? `Minggu ini ritmemu stabil lintas fitur. Kekuatan paling terlihat di ${strongestSignal.label.toLowerCase()} dan ini menjaga loop pemulihan tetap konsisten.`
    : crossFeatureCompletion >= 50
      ? `Progress mingguan sudah berjalan. Fokus berikutnya: naikkan intensitas ${weakestSignal.label.toLowerCase()} agar loop refleksi-ke-aksi lebih seimbang.`
      : crossFeatureCompletion > 0
        ? `Kamu sudah mulai membangun momentum. Lengkapi satu fitur lagi hari ini supaya narasi progresmu lebih utuh lintas fitur.`
        : "Belum ada sinyal lintas fitur minggu ini. Mulai dari satu aksi kecil agar storyline progresmu terbentuk.";

  const loopCompletion = Math.round((loopStages.filter((stage) => stage.completed).length / loopStages.length) * 100);
  const lastSyncLabel = lastSyncAt
    ? lastSyncAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "belum sinkron";

  // Theme-specific greeting emoji
  const greetingEmoji = themeKey === "ocean_calm" ? "🌊"
    : themeKey === "forest_zen" ? "🌿"
      : themeKey === "sunset_warmth" ? "🌅"
        : "👋";

  return (
    <div className="bg-gray-50/50 p-4 lg:p-6 space-y-6">

      {/* 1. Welcoming Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Halo, <span className="text-primary">{user?.name?.split(" ")[0] || "Teman"}!</span> {greetingEmoji}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {exclusivity.greeting}
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
            <Button className="rounded-full shadow-lg hover:shadow-xl transition-all gap-2 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border-0">
              <Sparkles className="w-4 h-4" />
              Teman Cerita AI
            </Button>
          </Link>
        </div>
      </div>

      {/* 1b. Daily Priority / Next Best Action */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Langkah Hari Ini</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{nextBestAction.title}</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">{nextBestAction.description}</p>
          </div>
          <Link href={nextBestAction.href}>
            <Button className="gap-2 w-full md:w-auto">
              {nextBestAction.cta}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {isNetworkDegraded && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-white p-1.5 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Koneksi terdeteksi tidak stabil</p>
              <p className="text-xs text-amber-800 mt-1">
                Beberapa widget mungkin tampil dengan data terakhir agar flow utama tetap usable. Sinkron terakhir: {lastSyncLabel}.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingWidgets}
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={refreshDashboardData}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingWidgets ? "animate-spin" : ""}`} />
            Muat Ulang Data
          </Button>
        </section>
      )}

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        className="rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-orange-50 p-5 md:p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-600">Signature Loop</p>
            <h2 className="font-brand-display text-xl md:text-2xl font-bold text-gray-900 mt-1">
              Refleksi {"->"} Progres {"->"} Reward {"->"} Komunitas
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Ini bukan deretan menu. Setiap langkah otomatis mendorong langkah berikutnya agar perjalananmu terasa terarah.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="relative h-16 w-16 rounded-full"
              style={{
                background: `conic-gradient(var(--color-primary) ${loopCompletion * 3.6}deg, #E5E7EB 0deg)`,
              }}
            >
              <div className="absolute inset-1.25 rounded-full bg-white grid place-items-center text-sm font-bold text-gray-900">
                {loopCompletion}%
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Loop Completion</p>
              <p className="text-xs text-gray-500">Target minimal harian: 50%+</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {loopStages.map((stage) => (
            <Link key={stage.key} href={stage.href}>
              <div className="rounded-2xl border border-white bg-white/85 p-3.5 hover:shadow-md hover:border-rose-200 transition-all h-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 grid place-items-center">
                    <stage.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full ${stage.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {stage.completed ? "Done" : "Next"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-2">{stage.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{stage.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        className="rounded-3xl border border-sky-200 bg-linear-to-br from-sky-50 via-white to-cyan-50 p-5 md:p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-700">Weekly Storyline</p>
            <h2 className="font-brand-display text-xl md:text-2xl font-bold text-gray-900 mt-1">
              Narasi Progres Mingguan Lintas Fitur
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">{weeklyCrossFeatureNarrative}</p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white px-4 py-3 min-w-40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Loop Weekly Fit</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{crossFeatureCompletion}%</p>
            <p className="text-[11px] text-gray-500 mt-1">keterisian sinyal lintas fitur</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
          {crossFeatureSignals.map((signal) => {
            const progress = Math.round(Math.min(signal.count / signal.target, 1) * 100);
            return (
              <Link key={signal.key} href={signal.href}>
                <div className="rounded-2xl border border-white bg-white/90 p-3.5 hover:shadow-md hover:border-sky-200 transition-all h-full">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">{signal.windowLabel}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{signal.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{signal.count}<span className="text-xs text-gray-500">/{signal.target}</span></p>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {weakestSignal && (
          <div className="mt-4 rounded-xl border border-sky-200 bg-white px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-sky-900">
              Prioritas minggu ini: perkuat <strong>{weakestSignal.label.toLowerCase()}</strong> agar progres lintas fitur lebih seimbang.
            </p>
            <Button asChild size="sm" variant="outline" className="bg-white border-sky-200 text-sky-700 hover:bg-sky-100">
              <Link href={weakestSignal.href} className="inline-flex items-center gap-1.5">
                Fokus ke {weakestSignal.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </motion.section>

      {/* 2. Main Dashboard Grid (Bento Box Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Left Column (wider): Widgets, Mood Calendar & Music Player */}
        <div className="md:col-span-8 space-y-6">

          {/* Top Widgets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-full">
              <QuickJournalWidget latestJournal={latestJournal} isLoading={isLoadingWidgets} />
            </div>
            <div className="h-full">
              <MoodInsightWidget moods={moodHistory} isLoading={isLoadingWidgets} activitySignals={moodActivitySignals} />
            </div>
          </div>

          {/* Consultation Promo */}
          <ConsultationPromoWidget />

          {/* Mood Calendar Section */}
          <MoodCalendar moods={moodHistory} />

          {/* Music Player — placed here (left col) to balance column heights */}
          <MusicPlayerWidget categories={categories} />
        </div>

        {/* Right Column (narrower): XP, Articles, Breathing & Story */}
        <div className="md:col-span-4 space-y-6">
          {/* XP Progress Widget */}
          <XPProgressWidget />

          {/* Guild Widget */}
          <GuildWidget />

          {/* Map Progress Widget */}
          <MapProgressWidget />

          {/* Recommended Articles */}
          <RecommendedArticlesWidget articles={recommendedArticles} isLoading={isLoadingWidgets} />

          {/* Breathing Widget */}
          {breathingWidgetData && (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <BreathingWidget data={breathingWidgetData} />
            </div>
          )}

          {/* Optional exploration widget */}
          <section className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Eksplorasi Opsional</p>
            <div className="mt-3">
              <StoryOfTheWeekWidget />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
