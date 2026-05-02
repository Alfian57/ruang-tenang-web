"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BookOpenCheck,
  Compass,
  Gift,
  Headphones,
  HeartHandshake,
  HelpCircle,
  Users,
  Wind,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useTheme } from "@/hooks/useTheme";
import type { WellnessNeedCondition } from "@/types/wellness";
import { useMemberDashboard } from "../../_hooks/useMemberDashboard";
import {
  formatQuotaReset,
  formatSyncTime,
  getGreetingEmoji,
  isToday,
  isWithinLast7Days,
} from "./member-dashboard-utils";
import type {
  CrossFeatureSignal,
  DashboardAction,
  LoopStage,
  NeedOption,
  TodayQuestStep,
} from "./types";

export function useMemberDashboardViewModel() {
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
    wellnessData,
    weeklyInsight,
    journeyMap,
    needNow,
    isNeedNowLoading,
    requestNeedNow,
    completeWellnessPlanItem,
  } = useMemberDashboard();

  const { exclusivity, themeKey } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedNeed, setSelectedNeed] = useState<WellnessNeedCondition | null>(null);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  const hasJournalToday = latestJournal ? isToday(latestJournal.created_at) : false;
  const hasMoodToday = moodHistory.some((mood) => isToday(mood.created_at));

  const nextBestAction: DashboardAction = hasJournalToday
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

  const loopStages: LoopStage[] = [
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

  const journalsThisWeek = recentJournals.filter((journal) => isWithinLast7Days(journal.created_at)).length;
  const moodCheckinsThisWeek = moodHistory.filter((mood) => isWithinLast7Days(mood.created_at)).length;
  const chatSessionsThisWeek = chatSessions.filter((session) => !session.is_trash && isWithinLast7Days(session.updated_at)).length;
  const breathingSessionsToday = breathingWidgetData?.today_sessions ?? 0;
  const articleSignalsToday = recommendedArticles.length > 0 ? 1 : 0;

  const crossFeatureSignals: CrossFeatureSignal[] = [
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
        ? "Kamu sudah mulai membangun momentum. Lengkapi satu fitur lagi hari ini supaya narasi progresmu lebih utuh lintas fitur."
        : "Belum ada sinyal lintas fitur minggu ini. Mulai dari satu aksi kecil agar storyline progresmu terbentuk.";

  const loopCompletion = Math.round((loopStages.filter((stage) => stage.completed).length / loopStages.length) * 100);
  const isPremiumAccount = Boolean(billingStatus?.is_premium || user?.is_premium);
  const chatQuota = billingStatus?.chat_quota;
  const chatQuotaLabel = !chatQuota
    ? "-"
    : chatQuota.is_unlimited
      ? "Tanpa batas"
      : `${Math.max(0, chatQuota?.remaining ?? 0)} / ${chatQuota?.limit ?? 0}`;
  const quotaRemaining = chatQuota?.remaining ?? 0;
  const isQuotaActionable = !isPremiumAccount && chatQuota && !chatQuota.is_unlimited && quotaRemaining <= Math.max(1, Math.ceil((chatQuota.limit ?? 0) * 0.25));
  const isChatLimitExhausted = !isPremiumAccount && Boolean(chatQuota && !chatQuota.is_unlimited && quotaRemaining <= 0);

  const todayQuestSteps: TodayQuestStep[] = [
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

  const wellnessPlan = wellnessData?.plan ?? null;
  const upcomingWellnessItem = wellnessPlan?.items.find((item) => item.status !== "completed") ?? wellnessPlan?.items[wellnessPlan.items.length - 1] ?? null;
  const needOptions: NeedOption<WellnessNeedCondition>[] = [
    { key: "cemas", label: "Cemas", icon: Wind },
    { key: "capek", label: "Capek", icon: Headphones },
    { key: "sedih", label: "Sedih", icon: HeartHandshake },
    { key: "marah", label: "Marah", icon: AlertTriangle },
    { key: "bingung", label: "Bingung", icon: HelpCircle },
    { key: "fokus", label: "Fokus", icon: Compass },
  ];
  const weeklyMoodCheckins = Number(weeklyInsight?.mood_summary?.checkins ?? 0);
  const weeklyProgressLabel = typeof weeklyInsight?.insight?.progress_label === "string"
    ? weeklyInsight.insight.progress_label
    : "mulai terbaca";
  const isWeeklyPremiumPreviewLocked = Boolean(weeklyInsight?.premium_preview?.locked);
  const weeklyPremiumPreviewTeaser = String(
    weeklyInsight?.premium_preview?.teaser ?? "Insight lanjutan terkunci untuk akun Premium."
  );
  const weeklyInsightActions = weeklyInsight?.recommendations?.length
    ? weeklyInsight.recommendations.slice(0, 3)
    : [
      {
        type: "mood",
        title: "Mulai dari mood check-in",
        description: "Catat kondisi hari ini agar insight minggu ini punya sinyal awal.",
        route: ROUTES.MOOD_TRACKER,
        locked: false,
      },
      {
        type: "journal",
        title: "Tulis jurnal singkat",
        description: "Ambil tiga menit untuk menuliskan satu rasa dan satu pemicu utama.",
        route: ROUTES.JOURNAL,
        locked: false,
      },
      {
        type: "breathing",
        title: "Tambah satu sesi napas",
        description: "Satu sesi pendek membantu menyeimbangkan progres refleksi dan regulasi.",
        route: ROUTES.BREATHING,
        locked: false,
      },
    ];
  const weeklyPeriodLabel = weeklyInsight?.week_start && weeklyInsight.week_end
    ? `${new Date(weeklyInsight.week_start).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - ${new Date(weeklyInsight.week_end).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}`
    : "Minggu berjalan";
  const weeklyGeneratedLabel = weeklyInsight?.generated_at
    ? new Date(weeklyInsight.generated_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Menunggu aktivitas";

  const handleNeedClick = async (condition: WellnessNeedCondition) => {
    setSelectedNeed(condition);
    await requestNeedNow(condition);
  };

  return {
    user,
    moodHistory,
    categories,
    latestJournal,
    recommendedArticles,
    isLoadingWidgets,
    breathingWidgetData,
    refreshDashboardData,
    theme: {
      greeting: exclusivity.greeting,
      greetingEmoji: getGreetingEmoji(themeKey),
      prefersReducedMotion,
    },
    header: {
      isChatLimitExhausted,
    },
    dailyQuest: {
      nextBestAction,
      shouldShowStartHint,
      todayQuestSteps,
      todayQuestCompletedCount,
      todayQuestCompletion,
      nextQuestStep,
      nextQuestDescription,
      isPremiumAccount,
      chatQuotaLabel,
      resetLabel: formatQuotaReset(chatQuota?.reset_at),
      isQuotaActionable,
    },
    network: {
      isNetworkDegraded,
      lastSyncLabel: formatSyncTime(lastSyncAt),
      isLoadingWidgets,
      refreshDashboardData,
    },
    wellness: {
      wellnessPlan,
      upcomingWellnessItem,
      completeWellnessPlanItem,
      refreshDashboardData,
    },
    needNow: {
      selectedNeed,
      needOptions,
      needNow,
      isNeedNowLoading,
      handleNeedClick,
    },
    weeklyInsight: {
      weeklyInsight,
      weeklyMoodCheckins,
      weeklyProgressLabel,
      isWeeklyPremiumPreviewLocked,
      weeklyPremiumPreviewTeaser,
      weeklyInsightActions,
      weeklyPeriodLabel,
      weeklyGeneratedLabel,
    },
    journeyMap,
    crisis: {
      showCrisisSupport,
      setShowCrisisSupport,
    },
    loop: {
      loopStages,
      loopCompletion,
    },
    storyline: {
      crossFeatureSignals,
      crossFeatureCompletion,
      weeklyCrossFeatureNarrative,
      weakestSignal,
    },
    widgets: {
      moodActivitySignals,
    },
  };
}

export type MemberDashboardViewModel = ReturnType<typeof useMemberDashboardViewModel>;
