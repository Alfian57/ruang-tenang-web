import Link from "next/link";
import { ArrowRight, CreditCard, Crown, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface DailyQuestSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function DailyQuestSection({ viewModel }: DailyQuestSectionProps) {
  const {
    nextBestAction,
    shouldShowStartHint,
    todayQuestSteps,
    todayQuestCompletedCount,
    todayQuestCompletion,
    nextQuestStep,
    nextQuestDescription,
    isPremiumAccount,
    chatQuotaLabel,
    resetLabel,
    isQuotaActionable,
  } = viewModel.dailyQuest;

  return (
    <section data-user-tour="user-reward" className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
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
  );
}
