"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Coins,
  Gamepad2,
  Gift,
  History,
  Loader2,
  MessageCircle,
  NotebookPen,
  Package,
  Palette,
  RefreshCw,
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

const CREATIVE_REWARD_ACTIONS = [
  {
    key: "reflect",
    title: "Refleksi 3 Menit",
    description: "Jaga ritme perjalanan lewat jurnal singkat.",
    href: "/dashboard/journal/create?mode=structured-reflection",
    icon: NotebookPen,
  },
  {
    key: "support",
    title: "Obrolan Tindak Lanjut",
    description: "Ubah insight menjadi langkah bersama AI.",
    href: "/dashboard/chat",
    icon: MessageCircle,
  },
  {
    key: "play",
    title: "Mindful Break",
    description: "Reset sejenak dengan mini game.",
    href: "/dashboard/game",
    icon: Gamepad2,
  },
] as const;

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
  const [category, setCategory] = useState("all");
  const {
    rewards,
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

  const categories = useMemo(
    () => Array.from(new Set(rewards.map((reward) => reward.reward_type || "reward"))),
    [rewards]
  );
  const filteredRewards = useMemo(() => {
    const filtered = category === "all"
      ? rewards
      : rewards.filter((reward) => (reward.reward_type || "reward") === category);
    return [...filtered].sort((a, b) => {
      const aTheme = a.reward_type === "theme" ? 1 : 0;
      const bTheme = b.reward_type === "theme" ? 1 : 0;
      return bTheme - aTheme || a.coin_cost - b.coin_cost;
    });
  }, [category, rewards]);

  if (loading) return <RewardsSkeleton />;

  if (hasError && rewards.length === 0 && claims.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-200 bg-white/80 px-6 py-16 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <RefreshCw className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Hadiah belum berhasil dimuat</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Saldo dan koleksimu tetap aman. Coba sambungkan kembali ke ruang hadiah.</p>
        <Button type="button" variant="outline" className="mt-5 gap-2 rounded-xl" onClick={() => void retry()}>
          <RefreshCw className="h-4 w-4" />
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="journey-reward-hero relative isolate overflow-hidden rounded-3xl border border-white/80 p-5 text-white sm:p-7">
        <div className="journey-hero-glow-primary pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full blur-3xl" />
        <div className="journey-hero-glow-secondary pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Hadiah untuk setiap langkahmu</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Tukarkan koin dengan tema dan benefit yang membuat pengalaman Ruang Tenang terasa lebih personal.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/20 bg-white/14 p-4 shadow-xl backdrop-blur-md sm:min-w-60">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/30 bg-white/20 shadow-inner">
                <CoinIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Saldo petualangan</p>
                <p className="mt-0.5 text-3xl font-black tracking-tight">{balance.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-white/15 pt-3 text-xs font-semibold text-white/75">
              <Palette className="h-3.5 w-3.5" />
              {ownedThemes.length} tema dimiliki
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/80 bg-white/85 p-2 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveView("available")}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
              activeView === "available" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <ShoppingBag className="h-4 w-4" /> Hadiah tersedia
          </button>
          <button
            type="button"
            onClick={() => setActiveView("history")}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
              activeView === "history" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <History className="h-4 w-4" /> Riwayat
          </button>
        </div>

        {activeView === "available" && categories.length > 1 ? (
          <div className="flex max-w-full gap-1.5 overflow-x-auto px-1 pb-0.5">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                category === "all" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
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
                  category === type ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
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
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center">
            <Package className="mx-auto h-14 w-14 text-slate-300" />
            <h3 className="mt-4 font-bold text-slate-600">Belum ada hadiah di kategori ini</h3>
            <p className="mt-1 text-sm text-slate-400">Hadiah baru akan muncul saat tersedia.</p>
          </div>
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
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center">
          <History className="mx-auto h-14 w-14 text-slate-300" />
          <h3 className="mt-4 font-bold text-slate-600">Belum ada riwayat klaim</h3>
          <p className="mt-1 text-sm text-slate-400">Hadiah yang kamu tukarkan akan tercatat di sini.</p>
        </div>
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

      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-primary/15 bg-[linear-gradient(135deg,rgba(239,68,68,0.06),rgba(255,255,255,0.88))] p-5">
          <div className="flex items-center gap-2 text-primary">
            <Gift className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.12em]">Lanjutkan momentummu</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {CREATIVE_REWARD_ACTIONS.map((action) => (
              <Link key={action.key} href={action.href} className="group rounded-2xl border border-white bg-white/85 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/8 text-primary">
                  <action.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">{action.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{action.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                  Mulai <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <details className="group rounded-3xl border border-amber-100 bg-amber-50/75 p-5 lg:w-80">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-amber-950">
            <span className="inline-flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-600" />
              Cara mendapat koin
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-4 space-y-2 text-xs leading-relaxed text-amber-800/80">
            <li>• Selesaikan misi harian melalui tombol mengambang.</li>
            <li>• Login dan jaga kebiasaan harianmu.</li>
            <li>• Gunakan jurnal, chat, artikel, dan aktivitas komunitas.</li>
            <li>• Klaim reward landmark dari Peta Perjalanan.</li>
          </ul>
        </details>
      </section>

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
