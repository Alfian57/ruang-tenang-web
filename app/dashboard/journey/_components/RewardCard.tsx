"use client";

import Image from "next/image";
import { CheckCircle2, Gift, Loader2, Lock, Palette, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { getUploadUrl } from "@/services/http/upload-url";
import type { Reward } from "@/types";
import { cn } from "@/utils";

interface RewardCardProps {
  reward: Reward;
  balance: number;
  isOwned: boolean;
  isActive: boolean;
  isClaiming: boolean;
  isBusy: boolean;
  isActivating: boolean;
  onConfirmClaim: (reward: Reward) => void;
  onActivateTheme: (theme: string) => void;
}

function getRewardMeta(reward: Reward) {
  if (reward.reward_type === "theme") {
    return { label: "Tema", icon: Palette, badge: "bg-violet-50 text-violet-700 border-violet-100" };
  }
  if (reward.reward_type === "xp_boost") {
    return { label: "XP Boost", icon: Rocket, badge: "bg-sky-50 text-sky-700 border-sky-100" };
  }
  return { label: "Hadiah", icon: Gift, badge: "bg-amber-50 text-amber-700 border-amber-100" };
}

export function RewardCard({
  reward,
  balance,
  isOwned,
  isActive,
  isClaiming,
  isBusy,
  isActivating,
  onConfirmClaim,
  onActivateTheme,
}: RewardCardProps) {
  const canAfford = balance >= reward.coin_cost;
  const isOutOfStock = reward.stock === 0;
  const affordability = reward.coin_cost > 0 ? Math.min(100, (balance / reward.coin_cost) * 100) : 100;
  const meta = getRewardMeta(reward);
  const TypeIcon = meta.icon;
  const themeValue = reward.reward_type === "theme" ? reward.reward_value : undefined;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/85 bg-white/92 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-34px_rgba(15,23,42,0.55)]",
        isOutOfStock && "opacity-70"
      )}
    >
      <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#fff7ed,#fffbeb_50%,#f5f3ff)]">
        {reward.image ? (
          <Image
            src={reward.image.startsWith("http") ? reward.image : getUploadUrl(reward.image)}
            alt={reward.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <>
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-300/30 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-violet-300/25 blur-2xl" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-20 w-20 place-items-center rounded-[1.75rem] border border-white bg-white/75 text-amber-500 shadow-lg backdrop-blur">
                <Gift className="h-9 w-9 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
              </div>
            </div>
          </>
        )}

        <div className="absolute left-3 top-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm backdrop-blur", meta.badge)}>
            <TypeIcon className="h-3 w-3" /> {meta.label}
          </span>
        </div>

        <div className="absolute right-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur">
          {isOutOfStock ? "Stok habis" : `${reward.stock} tersedia`}
        </div>

        {isOwned ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-emerald-600/90 px-3 py-2 text-xs font-bold text-white backdrop-blur">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isActive ? "Sedang digunakan" : "Sudah dimiliki"}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-base font-black tracking-tight text-slate-950">{reward.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500">{reward.description}</p>
          </div>
        </div>

        {!isOwned && !isOutOfStock ? (
          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
              <span>{canAfford ? "Koinmu sudah cukup" : `Kurang ${(reward.coin_cost - balance).toLocaleString("id-ID")} koin`}</span>
              <span>{Math.round(affordability)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn("h-full rounded-full transition-[width] duration-500", canAfford ? "bg-emerald-500" : "bg-linear-to-r from-amber-400 to-orange-500")}
                style={{ width: `${affordability}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1.5 text-sm font-black text-amber-800">
            <CoinIcon className="h-5 w-5" />
            {reward.coin_cost.toLocaleString("id-ID")}
          </div>

          {themeValue && isOwned && !isActive ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isActivating}
              className="h-9 rounded-xl border-violet-200 bg-violet-50 text-xs text-violet-700 hover:bg-violet-100"
              onClick={() => onActivateTheme(themeValue)}
            >
              {isActivating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Palette className="mr-1.5 h-3.5 w-3.5" />}
              Aktifkan
            </Button>
          ) : isOwned ? (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isActive ? "Aktif" : "Dimiliki"}
            </span>
          ) : (
            <Button
              size="sm"
              disabled={!canAfford || isOutOfStock || isBusy}
              className={cn(
                "h-9 gap-1.5 rounded-xl px-4 text-xs shadow-sm",
                canAfford && !isOutOfStock
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-slate-100 text-slate-400"
              )}
              onClick={() => onConfirmClaim(reward)}
            >
              {isClaiming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : canAfford && !isOutOfStock ? (
                <Gift className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {isOutOfStock ? "Habis" : canAfford ? "Tukar" : "Koin kurang"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
