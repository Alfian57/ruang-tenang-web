import Link from "next/link";
import { ArrowRight, CalendarDays, Crown, Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface WeeklyInsightSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function WeeklyInsightSection({ viewModel }: WeeklyInsightSectionProps) {
  const {
    weeklyInsight,
    weeklyMoodCheckins,
    weeklyProgressLabel,
    isWeeklyPremiumPreviewLocked,
    weeklyPremiumPreviewTeaser,
    weeklyInsightActions,
    weeklyPeriodLabel,
    weeklyGeneratedLabel,
  } = viewModel.weeklyInsight;

  return (
    <section data-user-tour="user-weekly-insight" className="flex h-full flex-col rounded-2xl border border-primary/20 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Wawasan Mingguan AI</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">Laporan minggu {weeklyProgressLabel}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {weeklyInsight?.narrative ?? "Wawasan mingguan akan muncul setelah ada aktivitas mood, jurnal, breathing, chat, dan quest."}
          </p>
        </div>
        <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {weeklyInsight?.is_ai_enhanced ? "AI enhanced" : "Hybrid rule"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Mood</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{weeklyMoodCheckins}</p>
        </div>
        {["journals", "breathing_sessions", "chat_sessions"].map((key) => (
          <div key={key} className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{key.replace("_", " ")}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{Number(weeklyInsight?.activity_summary?.[key] ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Rekomendasi Minggu Ini</p>
              <h3 className="mt-1 text-sm font-semibold text-gray-900">Langkah kecil untuk mengisi wawasan</h3>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 text-primary/80" />
          </div>

          <div className="mt-3 grid gap-2">
            {weeklyInsightActions.map((item) => (
              <Link
                key={`${item.type}-${item.title}`}
                href={item.locked ? ROUTES.BILLING : item.route}
                className="group rounded-xl border border-white bg-white px-3 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">{item.type}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-600">{item.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary/80 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Periode
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-900">{weeklyPeriodLabel}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Diperbarui</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{weeklyGeneratedLabel}</p>
          </div>
        </div>
      </div>

      {isWeeklyPremiumPreviewLocked && (
        <Link href={ROUTES.BILLING} className="mt-4 block rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Pratinjau Premium terbuka sebagian</p>
              <p className="mt-1 text-sm leading-6 text-primary">{weeklyPremiumPreviewTeaser}</p>
            </div>
          </div>
        </Link>
      )}
    </section>
  );
}
