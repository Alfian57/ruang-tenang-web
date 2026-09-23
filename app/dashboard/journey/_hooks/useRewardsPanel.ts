"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { rewardService, xpBoostService } from "@/services/api";
import { ApiError } from "@/services/http/types";
import { useAuthStore } from "@/store/authStore";
import type { Reward, RewardClaim, XPBoostStatus } from "@/types";

const DEFAULT_XP_BOOST_MULTIPLIER = 2;
const DEFAULT_XP_BOOST_DURATION_SECONDS = 24 * 60 * 60;
const XP_BOOST_VALUE_PATTERN = /^\s*\d+(?:\.\d+)?x(?:_\d+[mhd])?\s*$/i;

function hasXPBoostKeyword(value?: string): boolean {
  const normalized = (value || "").toLowerCase();
  return normalized.includes("xp boost")
    || normalized.includes("xpboost")
    || normalized.includes("exp boost")
    || normalized.includes("expboost");
}

function isXPBoostReward(reward?: Partial<Reward> | null): boolean {
  if (!reward) return false;
  if (reward.reward_type === "xp_boost") return true;
  if (hasXPBoostKeyword(reward.name) || hasXPBoostKeyword(reward.description)) return true;
  return XP_BOOST_VALUE_PATTERN.test((reward.reward_value || "").trim().toLowerCase());
}

function parseXPBoostMultiplier(rawValue?: string): number {
  const normalized = (rawValue || "").trim().toLowerCase();
  if (!normalized) return DEFAULT_XP_BOOST_MULTIPLIER;
  const [rawMultiplier] = normalized.split("_");
  const parsed = Number.parseFloat(rawMultiplier.replace(/x$/i, ""));
  return Number.isFinite(parsed) && parsed > 1 ? parsed : DEFAULT_XP_BOOST_MULTIPLIER;
}

function parseXPBoostDurationSeconds(rawValue?: string): number {
  const token = (rawValue || "").trim().toLowerCase().split("_")[1];
  const match = token?.match(/^(\d+)([mhd])$/i);
  if (!match) return DEFAULT_XP_BOOST_DURATION_SECONDS;

  const amount = Number.parseInt(match[1], 10);
  if (!Number.isFinite(amount) || amount <= 0) return DEFAULT_XP_BOOST_DURATION_SECONDS;
  if (match[2] === "m") return amount * 60;
  if (match[2] === "h") return amount * 60 * 60;
  return amount * 24 * 60 * 60;
}

function buildOptimisticXPBoostStatus(reward: Reward): XPBoostStatus {
  const now = new Date();
  const remainingSeconds = parseXPBoostDurationSeconds(reward.reward_value);
  return {
    id: `optimistic-${now.getTime()}`,
    multiplier: parseXPBoostMultiplier(reward.reward_value),
    trigger_type: "reward",
    started_at: now.toISOString(),
    expires_at: new Date(now.getTime() + remainingSeconds * 1000).toISOString(),
    remaining_seconds: remainingSeconds,
  };
}

export function formatThemeLabel(theme: string) {
  if (theme === "default") return "Bawaan";
  return theme.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function useRewardsPanel() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const [ownedThemes, setOwnedThemes] = useState<string[]>(["default"]);
  const [activeTheme, setActiveTheme] = useState("default");
  const [activatingTheme, setActivatingTheme] = useState<string | null>(null);
  const canCustomizeThemes = user?.role === "user";
  const activeView: "available" | "history" = searchParams.get("view") === "history" ? "history" : "available";

  const setActiveView = useCallback((view: "available" | "history") => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "available") params.delete("view");
    else params.set("view", view);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const loadData = useCallback(async (silent = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
      setHasError(false);
    }
    try {
      const [rewardsRes, balanceRes, claimsRes, themesRes] = await Promise.all([
        rewardService.getAvailableRewards(token),
        rewardService.getCoinBalance(token),
        rewardService.getMyClaims(token, { page: 1, page_size: 50 }),
        rewardService.getOwnedThemes(token),
      ]);
      setRewards(Array.isArray(rewardsRes.data) ? rewardsRes.data : []);
      setBalance(Number(balanceRes.data?.gold_coins ?? 0));
      setClaims(claimsRes.data?.claims || []);
      if (themesRes.data && canCustomizeThemes) {
        setOwnedThemes(themesRes.data.owned_themes || ["default"]);
        setActiveTheme(themesRes.data.active_theme || "default");
      }
    } catch {
      if (!silent) setHasError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [canCustomizeThemes, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (user?.gold_coins !== undefined) setBalance(user.gold_coins);
    if (user?.role === "user" && user.profile_theme) {
      setActiveTheme(user.profile_theme);
      return;
    }
    if (user?.role !== "user") {
      setOwnedThemes(["default"]);
      setActiveTheme("default");
    }
  }, [user]);

  const activateTheme = useCallback(async (theme: string) => {
    if (!token || activatingTheme || !canCustomizeThemes) return;
    setActivatingTheme(theme);
    try {
      await rewardService.activateTheme(token, theme);
      setActiveTheme(theme);
      void refreshUser();
      window.dispatchEvent(new Event("themes-updated"));
      toast.success(`Tema ${formatThemeLabel(theme)} aktif!`, {
        description: "Tampilan dashboard kamu sudah diperbarui.",
      });
    } catch {
      toast.error("Gagal mengaktifkan tema");
    } finally {
      setActivatingTheme(null);
    }
  }, [activatingTheme, canCustomizeThemes, refreshUser, token]);

  const claimReward = useCallback(async (reward: Reward) => {
    if (!token || claimingId !== null) return;
    setClaimingId(reward.id);
    setConfirmReward(null);

    try {
      const response = await rewardService.claimReward(token, reward.id);
      if (!response.data) return;

      const claimedReward = response.data.claim?.reward || reward;
      const xpBoostClaimed = isXPBoostReward(claimedReward) || isXPBoostReward(reward);
      toast.success(`Berhasil mengklaim "${reward.name}"!`, {
        description: xpBoostClaimed
          ? `XP Boost aktif. Sisa koin: ${response.data.remaining_coins}`
          : `Sisa koin: ${response.data.remaining_coins}`,
      });

      if (xpBoostClaimed) {
        let status: XPBoostStatus | null | undefined = buildOptimisticXPBoostStatus(reward);
        try {
          const activeBoost = await xpBoostService.getActiveBoost(token);
          status = activeBoost.data ?? null;
        } catch (error) {
          if (!(error instanceof ApiError && error.isNotFound)) {
            status = undefined;
          }
        }
        if (status === undefined) {
          window.dispatchEvent(new Event("xp-boost-updated"));
        } else {
          window.dispatchEvent(new CustomEvent("xp-boost-updated", { detail: { status } }));
        }
      }

      setBalance(response.data.remaining_coins);
      if (reward.reward_type === "theme") {
        window.dispatchEvent(new Event("themes-updated"));
      }
      await Promise.allSettled([loadData(true), refreshUser()]);
    } catch {
      toast.error("Gagal mengklaim hadiah");
    } finally {
      setClaimingId(null);
    }
  }, [claimingId, loadData, refreshUser, token]);

  return {
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
    canCustomizeThemes,
    activeView,
    setActiveView,
    activateTheme,
    claimReward,
    retry: loadData,
  };
}
