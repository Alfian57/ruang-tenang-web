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
  CreditCard,
  Crown,
  Gift,
  Lock,
  MessageSquare,
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
    billingStatus,
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

  const isToday = (timestamp?: string) => {
    if (!timestamp) return false;
    return new Date(timestamp).toDateString() === new Date().toDateString();
  };

  const hasJournalToday = latestJournal
    ? isToday(latestJournal.created_at)
    : false;
  const hasMoodToday = moodHistory.some((mood) => isToday(mood.created_at));

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
      label: "Pernapasan",
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
  const isPremiumAccount = Boolean(billingStatus?.is_premium || user?.is_premium);
  const chatQuota = billingStatus?.chat_quota;
  const chatQuotaLabel = !chatQuota
    ? "-"
    : chatQuota.is_unlimited
    ? "Tanpa batas"
    : `${Math.max(0, chatQuota?.remaining ?? 0)} / ${chatQuota?.limit ?? 0}`;
  const resetLabel = chatQuota?.reset_at
    ? new Date(chatQuota.reset_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";
  const quotaRemaining = chatQuota?.remaining ?? 0;
  const isQuotaActionable = !isPremiumAccount && chatQuota && !chatQuota.is_unlimited && quotaRemaining <= Math.max(1, Math.ceil((chatQuota.limit ?? 0) * 0.25));
  const isChatLimitExhausted = !isPremiumAccount && Boolean(chatQuota && !chatQuota.is_unlimited && quotaRemaining <= 0);
  const todayQuestSteps = [
    {
      key: "mood",
      label: "Mood check-in",
      completed: hasMoodToday,
      href: ROUTES.MOOD_TRACKER,
    },
    {
      key: "journal",
      label: "Jurnal 3 menit",
      completed: hasJournalToday,
      href: ROUTES.JOURNAL,
    },
    {
      key: "chat",
      label: "Chat reflektif",
      completed: chatSessionsThisWeek > 0,
      href: isChatLimitExhausted ? ROUTES.BILLING : ROUTES.CHAT,
      locked: isChatLimitExhausted,
    },
    {
      key: "reward",
      label: "Cek reward",
      completed: loopCompletion >= 50,
      href: ROUTES.REWARDS,
    },
  ];
  const todayQuestCompletedCount = todayQuestSteps.filter((step) => step.completed).length;
  const todayQuestCompletion = Math.round((todayQuestCompletedCount / todayQuestSteps.length) * 100);
  const nextQuestStep = todayQuestSteps.find((step) => !step.completed) ?? todayQuestSteps[todayQuestSteps.length - 1];
  const nextQuestDescription = nextQuestStep.locked
    ? "Kuota chat sedang habis. Buka billing untuk upgrade, atau lanjutkan refleksi lewat jurnal dan pernapasan."
    : nextQuestStep.key === "mood"
      ? "Check-in singkat akan membuat rekomendasi harian lebih akurat."
      : nextQuestStep.key === "journal"
        ? "Tulis 3 menit saja. Fokus pada satu kejadian, satu rasa, dan satu langkah kecil."
        : nextQuestStep.key === "chat"
          ? "Gunakan chat untuk merapikan isi jurnal menjadi langkah yang lebih jelas."
          : "Cek reward agar progres hari ini terasa selesai dan ada dorongan untuk lanjut besok.";
  const shouldShowStartHint = !hasMoodToday && !hasJournalToday && chatSessionsThisWeek === 0;

  // Theme-specific greeting emoji
  const greetingEmoji = themeKey === "ocean_calm" ? "🌊"
    : themeKey === "forest_zen" ? "🌿"
      : themeKey === "sunset_warmth" ? "🌅"
        : "👋";

  return (
    <div className="mx-auto w-full max-w-[112rem] space-y-6 bg-gray-50/50 p-3 xs:p-4 lg:p-6">

      {/* 1. Welcoming Header */}
      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 xs:text-2xl md:text-3xl">
            Halo, <span className="text-primary">{user?.name?.split(" ")[0] || "Teman"}!</span> {greetingEmoji}
          </h1>
          <p className="mt-1 text-base text-gray-500 md:text-lg">
            {exclusivity.greeting}
          </p>
        </div>
        <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:gap-3">
          <Link href={ROUTES.JOURNAL}>
            <Button variant="outline" className="rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors gap-2">
              <Calendar className="w-4 h-4" />
              Tulis Jurnal
            </Button>
          </Link>
          <Link href={isChatLimitExhausted ? ROUTES.BILLING : ROUTES.CHAT}>
            <Button className={`rounded-full shadow-lg hover:shadow-xl transition-all gap-2 border-0 ${isChatLimitExhausted ? "bg-amber-600 hover:bg-amber-700" : "bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"}`}>
              {isChatLimitExhausted ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {isChatLimitExhausted ? "Limit Chat Habis" : "Teman Cerita AI"}
            </Button>
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
          <div className="flex h-full min-w-0 flex-col">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Quest Hari Ini</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">{nextBestAction.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-600">{nextBestAction.description}</p>
              </div>
              <Link href={nextBestAction.href}>
                <Button className="w-full gap-2 md:w-auto">
                  {nextBestAction.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {shouldShowStartHint && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">Mulai dari sini</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Belum ada aktivitas hari ini. Mulai dari mood check-in atau jurnal singkat agar dashboard berikutnya terasa lebih personal.
                </p>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {todayQuestSteps.map((step) => (
                <Link key={step.key} href={step.href}>
                  <div className={`h-full rounded-xl border px-3 py-3 transition-colors ${step.completed ? "border-emerald-200 bg-emerald-50" : step.locked ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-gray-200 bg-gray-50 hover:border-rose-200 hover:bg-rose-50"}`}>
                    <p className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${step.completed ? "text-emerald-700" : step.locked ? "text-amber-700" : "text-gray-500"}`}>
                      {step.locked && <Lock className="h-3 w-3" />}
                      {step.completed ? "Done" : step.locked ? "Locked" : "Next"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{step.label}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 grid flex-1 gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <Link
                href={nextQuestStep.href}
                className={`group rounded-2xl border p-4 transition-all ${nextQuestStep.locked ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-rose-200 bg-rose-50/70 hover:bg-rose-100/70"}`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${nextQuestStep.locked ? "text-amber-700" : "text-primary"}`}>
                  Langkah berikutnya
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900">{nextQuestStep.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{nextQuestDescription}</p>
                  </div>
                  <div className={`shrink-0 rounded-full p-2 transition-transform group-hover:translate-x-0.5 ${nextQuestStep.locked ? "bg-amber-100 text-amber-700" : "bg-white text-primary"}`}>
                    {nextQuestStep.locked ? <Lock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </div>
                </div>
              </Link>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Momentum Hari Ini</p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900">
                      {todayQuestCompletedCount}/{todayQuestSteps.length} quest selesai
                    </h3>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-xs">
                    {todayQuestCompletion}%
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-linear-to-r from-primary to-rose-400" style={{ width: `${todayQuestCompletion}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {todayQuestSteps.map((step) => (
                    <div key={`mini-${step.key}`} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${step.completed ? "bg-emerald-500" : step.locked ? "bg-amber-500" : "bg-gray-300"}`} />
                      <span className="min-w-0 truncate text-xs font-medium text-gray-700">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-xl p-2.5 ${isPremiumAccount ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"}`}>
                {isPremiumAccount ? <Crown className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status Paket</p>
                <h3 className="mt-1 text-base font-semibold text-gray-900">
                  {isPremiumAccount ? "Premium aktif" : "Akun Gratis"}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {isPremiumAccount
                    ? "Chat AI tanpa batas dan misi premium harian sudah terbuka untuk akun ini."
                    : "Akun gratis punya batas chat per periode. Kuota akan refresh otomatis, dan Premium membuka chat tanpa batas."}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Kuota
                </div>
                <p className="mt-1 text-lg font-bold text-gray-900">{chatQuotaLabel}</p>
                <p className="text-[11px] text-gray-500">Reset {resetLabel}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quest</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{todayQuestCompletion}%</p>
                <p className="text-[11px] text-gray-500">progress hari ini</p>
              </div>
            </div>

            <Link href={ROUTES.BILLING} className={`mt-3 block rounded-xl border px-3 py-3 transition-colors ${isQuotaActionable ? "border-amber-300 bg-amber-100 hover:bg-amber-200" : "border-violet-200 bg-violet-50 hover:bg-violet-100"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isQuotaActionable ? "text-amber-800" : "text-violet-700"}`}>
                {isPremiumAccount ? "Kelola Paket" : isQuotaActionable ? "Kuota Hampir Habis" : "Upgrade"}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {isPremiumAccount ? "Billing & riwayat" : "Buka Premium"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600">
                Lihat halaman billing
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </Link>
          </aside>
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

        <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-5">
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
            <div className="space-y-6">
              <QuickJournalWidget latestJournal={latestJournal} isLoading={isLoadingWidgets} />

              {/* Keep desktop layout compact by stacking consultation below journal */}
              <div className="hidden md:block">
                <ConsultationPromoWidget />
              </div>
            </div>
            <div className="h-full">
              <MoodInsightWidget moods={moodHistory} isLoading={isLoadingWidgets} activitySignals={moodActivitySignals} />
            </div>
          </div>

          {/* Preserve mobile order: Quick Journal -> Mood Insight -> Consultation */}
          <div className="md:hidden">
            <ConsultationPromoWidget />
          </div>

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
