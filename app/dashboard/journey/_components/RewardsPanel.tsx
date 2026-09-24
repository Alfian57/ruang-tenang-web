"use client";

import {
  Clock3,
  Gift,
  History,
  Loader2,
  Palette,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { cn } from "@/utils";
import { RewardCard } from "./RewardCard";
import { useRewardsPanel } from "../_hooks/useRewardsPanel";
import { Pagination } from "@/components/ui/pagination";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

function getCategoryLabel(type: string) {
  if (type === "theme") return "Tema";
  if (type === "xp_boost") return "XP Boost";
  return type.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function RewardsSkeleton() {
  return (
    <div className="space-y-5" aria-label="Memuat hadiah">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[27rem] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export default function RewardsPanel() {
  const {
    rewards,
    rewardTypes,
    rewardTotalPages,
    claimTotalPages,
    category,
    setCategory,
    page,
    setPage,
    claims,
    balance,
    loading,
    hasError,
    claimingId,
    confirmReward,
    setConfirmReward,
    ownedThemes,
    activeTheme,
    activatingTheme,
    activeView,
    setActiveView,
    activateTheme,
    claimReward,
    retry,
  } = useRewardsPanel();

  const categories = rewardTypes;
  const filteredRewards = rewards;

  if (loading) return <RewardsSkeleton />;

  if (hasError && rewards.length === 0 && claims.length === 0) {
    return (
      <DashboardMascotEmpty image="/images/landing/mascot/trophy.webp" title="Hadiah belum berhasil dimuat" description="Saldo dan koleksimu tetap aman. Coba sambungkan kembali ke ruang hadiah." action={<Button type="button" variant="outline" onClick={() => void retry()}>Coba lagi</Button>} />
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="journey-reward-hero theme-accent-border-soft relative isolate overflow-hidden rounded-3xl border p-5 sm:p-7">
        <div className="journey-hero-glow-primary pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full blur-3xl" />
        <div className="journey-hero-glow-secondary pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:radial-gradient(#64748b_0.7px,transparent_0.7px)] [background-size:20px_20px]" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark">Ruang apresiasi</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Hadiah untuk setiap langkahmu</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Tukarkan koin dengan tema dan benefit yang membuat pengalaman Ruang Tenang terasa lebih personal.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/90 bg-white/85 p-4 shadow-sm backdrop-blur-md sm:min-w-60">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100 bg-amber-50">
                <CoinIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Saldo petualangan</p>
                <p className="mt-0.5 text-3xl font-black tracking-tight text-slate-900">{balance.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
              <Palette className="h-3.5 w-3.5 text-theme-accent" />
              {ownedThemes.length} tema dimiliki
            </div>
          </div>
        </div>
      </section>

      <div className="theme-accent-border-soft flex min-w-0 flex-col gap-3 rounded-2xl border bg-white/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveView("available")}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition",
              activeView === "available" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <ShoppingBag className="h-4 w-4" /> Hadiah tersedia
          </button>
          <button
            type="button"
            onClick={() => setActiveView("history")}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition",
              activeView === "history" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <History className="h-4 w-4" /> Riwayat
          </button>
        </div>

        {activeView === "available" && categories.length > 1 ? (
          <div className="flex max-w-full gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin]" aria-label="Filter jenis hadiah">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                category === "all" ? "border-theme-accent-border bg-theme-accent-soft text-theme-accent-dark" : "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
              )}
            >
              Semua
            </button>
            {categories.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCategory(type)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  category === type ? "border-theme-accent-border bg-theme-accent-soft text-theme-accent-dark" : "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                )}
              >
                {getCategoryLabel(type)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {activeView === "available" ? (
        filteredRewards.length === 0 ? (
          <DashboardMascotEmpty image="/images/landing/mascot/trophy.webp" title="Belum ada hadiah di kategori ini" description="Hadiah baru akan muncul saat tersedia. Langkah kecilmu tetap berharga." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRewards.map((reward) => {
              const themeValue = reward.reward_type === "theme" ? reward.reward_value : undefined;
              const isOwned = Boolean(themeValue && ownedThemes.includes(themeValue));
              return (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  balance={balance}
                  isOwned={isOwned}
                  isActive={Boolean(themeValue && activeTheme === themeValue)}
                  isClaiming={claimingId === reward.id}
                  isBusy={claimingId !== null}
                  isActivating={Boolean(themeValue && activatingTheme === themeValue)}
                  onConfirmClaim={setConfirmReward}
                  onActivateTheme={(theme) => void activateTheme(theme)}
                />
              );
            })}
          </div>
        )
      ) : claims.length === 0 ? (
        <DashboardMascotEmpty image="/images/landing/mascot/trophy.webp" title="Belum ada riwayat klaim" description="Hadiah yang kamu tukarkan akan tercatat di sini." />
      ) : (
        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-black text-slate-950">Jejak hadiahmu</h3>
            <p className="mt-0.5 text-xs text-slate-500">{claims.length} hadiah telah diklaim.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <article key={claim.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-amber-50/35">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                  <Gift className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-slate-900">{claim.reward?.name || "Hadiah"}</h4>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                    <Clock3 className="h-3 w-3" />
                    {new Date(claim.claimed_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-sm font-black text-amber-700">
                  -{claim.coin_spent}<CoinIcon className="h-4 w-4" />
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      <Pagination currentPage={page} totalPages={activeView === "history" ? claimTotalPages : rewardTotalPages} onPageChange={setPage} />

      <Dialog
        open={Boolean(confirmReward)}
        onOpenChange={(open) => {
          if (!open && claimingId === null) setConfirmReward(null);
        }}
      >
        <DialogContent className="overflow-hidden rounded-3xl border-amber-100 p-0 sm:max-w-md">
          <div className="bg-[linear-gradient(135deg,#fffbeb,#fff7ed)] px-6 pb-5 pt-7 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-amber-400 text-white shadow-lg shadow-amber-300/30">
              <Gift className="h-7 w-7" />
            </div>
            <DialogHeader className="mt-4 text-center">
              <DialogTitle className="text-xl font-black tracking-tight text-slate-950">Tukar hadiah ini?</DialogTitle>
              <DialogDescription className="leading-relaxed">
                {confirmReward
                  ? `${confirmReward.name} akan ditukar dengan ${confirmReward.coin_cost.toLocaleString("id-ID")} koin.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6">
            <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <span className="font-medium text-slate-500">Saldo setelah klaim</span>
              <span className="inline-flex items-center gap-1 font-black text-amber-700">
                {Math.max(0, balance - (confirmReward?.coin_cost ?? 0)).toLocaleString("id-ID")}
                <CoinIcon className="h-4 w-4" />
              </span>
            </div>
            <DialogFooter className="gap-2 sm:space-x-0">
              <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" disabled={claimingId !== null} onClick={() => setConfirmReward(null)}>
                Nanti saja
              </Button>
              <Button
                type="button"
                className="h-11 flex-1 gap-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                disabled={!confirmReward || claimingId !== null}
                onClick={() => {
                  if (confirmReward) void claimReward(confirmReward);
                }}
              >
                {claimingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <CoinIcon className="h-4 w-4" />}
                Tukar sekarang
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
