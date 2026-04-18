"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Gift, Loader2, ShoppingBag, History, Package, AlertCircle, CheckCircle, Palette, WandSparkles, NotebookPen, MessageCircle, Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { cn } from "@/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { rewardService, xpBoostService } from "@/services/api";
import { ApiError } from "@/services/http/types";
import { getUploadUrl } from "@/services/http/upload-url";
import type { Reward, RewardClaim, XPBoostStatus } from "@/types";

const DEFAULT_XP_BOOST_MULTIPLIER = 2;
const DEFAULT_XP_BOOST_DURATION_SECONDS = 24 * 60 * 60;
const XP_BOOST_VALUE_PATTERN = /^\s*\d+(?:\.\d+)?x(?:_\d+[mhd])?\s*$/i;

function hasXPBoostKeyword(value?: string): boolean {
  const normalized = (value || "").toLowerCase();

  return (
    normalized.includes("xp boost") ||
    normalized.includes("xpboost") ||
    normalized.includes("exp boost") ||
    normalized.includes("expboost")
  );
}

function isXPBoostRewardLike(reward?: Partial<Reward> | null): boolean {
  if (!reward) return false;

  if (reward.reward_type === "xp_boost") return true;

  if (hasXPBoostKeyword(reward.name) || hasXPBoostKeyword(reward.description)) {
    return true;
  }

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
  const normalized = (rawValue || "").trim().toLowerCase();
  if (!normalized) return DEFAULT_XP_BOOST_DURATION_SECONDS;

  const parts = normalized.split("_");
  if (parts.length < 2) return DEFAULT_XP_BOOST_DURATION_SECONDS;

  const token = parts[1].trim();
  const matched = token.match(/^(\d+)([mhd])$/i);
  if (!matched) return DEFAULT_XP_BOOST_DURATION_SECONDS;

  const amount = Number.parseInt(matched[1], 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    return DEFAULT_XP_BOOST_DURATION_SECONDS;
  }

  const unit = matched[2].toLowerCase();
  if (unit === "m") return amount * 60;
  if (unit === "h") return amount * 60 * 60;
  if (unit === "d") return amount * 24 * 60 * 60;
  return DEFAULT_XP_BOOST_DURATION_SECONDS;
}

function buildOptimisticXPBoostStatus(reward?: Partial<Reward> | null): XPBoostStatus {
  const now = new Date();
  const remainingSeconds = parseXPBoostDurationSeconds(reward?.reward_value);
  const expiresAt = new Date(now.getTime() + remainingSeconds * 1000);

  return {
    id: `optimistic-${now.getTime()}`,
    multiplier: parseXPBoostMultiplier(reward?.reward_value),
    trigger_type: "reward",
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    remaining_seconds: remainingSeconds,
  };
}

export default function RewardsPage() {
  const { token, user, refreshUser } = useAuthStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");
  const [confirmRewardId, setConfirmRewardId] = useState<number | null>(null);
  const [ownedThemes, setOwnedThemes] = useState<string[]>(["default"]);
  const [activeTheme, setActiveTheme] = useState<string>("default");
  const [activatingTheme, setActivatingTheme] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rewardsRes, balanceRes, claimsRes, themesRes] = await Promise.all([
        rewardService.getAvailableRewards(token),
        rewardService.getCoinBalance(token),
        rewardService.getMyClaims(token, { page: 1, page_size: 50 }),
        rewardService.getOwnedThemes(token),
      ]);
      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (balanceRes.data) setBalance(balanceRes.data.gold_coins);
      if (claimsRes.data) setClaims(claimsRes.data.claims || []);
      if (themesRes.data) {
        setOwnedThemes(themesRes.data.owned_themes || ["default"]);
        setActiveTheme(themesRes.data.active_theme || "default");
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user?.gold_coins !== undefined) {
      setBalance(user.gold_coins);
    }
    if (user?.profile_theme) {
      setActiveTheme(user.profile_theme);
    }
  }, [user]);

  const formatThemeLabel = (theme: string) =>
    theme
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleActivateTheme = async (theme: string) => {
    if (!token || activatingTheme) return;

    setActivatingTheme(theme);
    try {
      await rewardService.activateTheme(token, theme);
      setActiveTheme(theme);
      refreshUser();
      toast.success(`Tema ${formatThemeLabel(theme)} aktif!`, {
        description: "Tampilan dashboard kamu sudah diperbarui.",
      });
    } catch {
      toast.error("Gagal mengaktifkan tema");
    } finally {
      setActivatingTheme(null);
    }
  };

  const handleClaim = async (reward: Reward) => {
    if (!token || claimingId !== null) return;

    setClaimingId(reward.id);
    setConfirmRewardId(null);
    try {
      const res = await rewardService.claimReward(token, reward.id);
      if (res.data) {
        const claimedReward = res.data.claim?.reward || reward;
        const xpBoostClaimed = isXPBoostRewardLike(claimedReward) || isXPBoostRewardLike(reward);
        toast.success(`Berhasil mengklaim "${reward.name}"!`, {
          description: xpBoostClaimed
            ? `XP Boost aktif. Sisa koin: ${res.data.remaining_coins}`
            : `Sisa koin: ${res.data.remaining_coins}`,
        });

        let statusForEvent: XPBoostStatus | null | undefined;
        if (xpBoostClaimed) {
          // Optimistic status keeps UI responsive even if immediate refresh fails.
          statusForEvent = buildOptimisticXPBoostStatus(claimedReward);
        }

        try {
          const activeBoostRes = await xpBoostService.getActiveBoost(token);
          statusForEvent = activeBoostRes.data ?? null;
        } catch (error) {
          if (error instanceof ApiError && error.isNotFound) {
            statusForEvent = null;
          }
        }

        if (statusForEvent === undefined) {
          window.dispatchEvent(new Event("xp-boost-updated"));
        } else {
          window.dispatchEvent(
            new CustomEvent("xp-boost-updated", {
              detail: { status: statusForEvent },
            })
          );
        }

        setBalance(res.data.remaining_coins);
        fetchData();
        refreshUser();
      }
    } catch {
      toast.error("Gagal mengklaim hadiah");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const rewardsByImpact = [...rewards].sort((a, b) => {
    const aTheme = a.reward_type === "theme" ? 1 : 0;
    const bTheme = b.reward_type === "theme" ? 1 : 0;
    return bTheme - aTheme;
  });

  const creativeRewardActions = [
    {
      key: "reflect",
      title: "Refleksi 3 Menit",
      description: "Buka peluang reward berkelanjutan dengan journaling singkat yang konsisten.",
      href: "/dashboard/journal/create?mode=structured-reflection",
      icon: NotebookPen,
    },
    {
      key: "support",
      title: "Obrolan Tindak Lanjut",
      description: "Setelah klaim reward, lanjutkan sesi AI untuk menjaga momentum pemulihan.",
      href: "/dashboard/chat",
      icon: MessageCircle,
    },
    {
      key: "play",
      title: "Mindful Break",
      description: "Gunakan mini game untuk reset emosi sebelum kembali ke rutinitas utama.",
      href: "/dashboard/game",
      icon: Gamepad2,
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header with coin balance */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-7 h-7 text-amber-500" />
              Klaim Hadiah
            </h1>
            <p className="text-gray-500 mt-1">Tukarkan koin emas kamu dengan hadiah menarik</p>
          </div>
          <div className="bg-linear-to-r from-amber-400 to-yellow-500 text-white rounded-xl px-4 py-2 shadow-md ring-1 ring-amber-300/50 inline-flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/35 rounded-full ring-1 ring-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65),0_1px_4px_rgba(0,0,0,0.12)] flex items-center justify-center shrink-0">
              <CoinIcon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-white/85 tracking-wide">Saldo Koin</p>
              <p className="text-2xl font-bold">{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-sky-50 p-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <WandSparkles className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase tracking-wide">REWARD-1</p>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mt-2">Hadiah yang mengubah pengalaman</h2>
          <p className="text-sm text-gray-600 mt-1">
            Prioritas hadiah sekarang bukan sekadar koleksi. Klaim lalu pakai agar pengalaman harianmu terasa berbeda.
          </p>
          <div className="mt-3 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/70 bg-white/70 px-3 py-2">1. Klaim hadiah yang relevan dengan kondisimu.</div>
            <div className="rounded-lg border border-white/70 bg-white/70 px-3 py-2">2. Aktifkan tema/benefit-nya segera.</div>
            <div className="rounded-lg border border-white/70 bg-white/70 px-3 py-2">3. Lanjutkan ke journaling/chat untuk efek berkelanjutan.</div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Theme Locker</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">Tema Aktif: {formatThemeLabel(activeTheme)}</h3>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700">
              <Palette className="w-3.5 h-3.5" />
              {ownedThemes.length} tema dimiliki
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {ownedThemes.map((theme) => {
              const isActive = theme === activeTheme;
              return (
                <Button
                  key={theme}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  disabled={isActive || activatingTheme === theme}
                  className="h-8"
                  onClick={() => handleActivateTheme(theme)}
                >
                  {activatingTheme === theme ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : null}
                  {formatThemeLabel(theme)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("rewards")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "rewards"
              ? "border-amber-500 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          Hadiah Tersedia
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "history"
              ? "border-amber-500 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <History className="w-4 h-4" />
          Riwayat Klaim
        </button>
      </div>

      {/* Rewards Grid */}
      {activeTab === "rewards" && (
        <>
          {rewards.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada hadiah tersedia</h3>
              <p className="text-gray-400 text-sm mt-1">Hadiah akan segera ditambahkan oleh admin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rewardsByImpact.map((reward) => {
                const canAfford = balance >= reward.coin_cost;
                const isOutOfStock = reward.stock === 0;
                const isConfirming = confirmRewardId === reward.id;
                const isThemeOwned = reward.reward_type === "theme" && reward.reward_value
                  ? ownedThemes.includes(reward.reward_value)
                  : false;
                const canActivateTheme = reward.reward_type === "theme" && reward.reward_value
                  ? isThemeOwned && reward.reward_value !== activeTheme
                  : false;
                const rewardImpactCopy = reward.reward_type === "theme"
                  ? "Mengubah nuansa visual dashboard dan ritual harian."
                  : "Mendukung progres kamu lewat loop reward dan aksi.";

                return (
                  <div
                    key={reward.id}
                    className={cn(
                      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md group",
                      isOutOfStock && "opacity-60"
                    )}
                  >
                    {/* Reward Image/Icon */}
                    <div className="h-40 bg-linear-to-br from-amber-50 to-yellow-50 flex items-center justify-center relative overflow-hidden">
                      {reward.image ? (
                        <Image
                          src={reward.image.startsWith("http") ? reward.image : getUploadUrl(reward.image)}
                          alt={reward.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                      ) : (
                        <Gift className="w-16 h-16 text-amber-300 group-hover:scale-110 transition-transform" />
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Stok Habis
                          </span>
                        </div>
                      )}
                      {reward.stock > 0 && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-gray-600">
                          Sisa: {reward.stock}
                        </div>
                      )}
                    </div>

                    {/* Reward Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                        {reward.reward_type === "theme" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-1 text-[10px] font-semibold shrink-0">
                            <Palette className="w-3 h-3" /> Theme
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{reward.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{rewardImpactCopy}</p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5">
                          <CoinIcon className="h-5 w-5" />
                          <span className="font-bold text-amber-700">{reward.coin_cost}</span>
                        </div>

                        {canActivateTheme ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={activatingTheme === reward.reward_value}
                            className="text-xs h-8"
                            onClick={() => reward.reward_value && handleActivateTheme(reward.reward_value)}
                          >
                            {activatingTheme === reward.reward_value ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Aktifkan Tema"
                            )}
                          </Button>
                        ) : isThemeOwned ? (
                          <span className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-md bg-green-50 text-green-600 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {reward.reward_value === activeTheme ? "Tema Aktif" : "Sudah Dimiliki"}
                          </span>
                        ) : isConfirming ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmRewardId(null)}
                              className="text-xs h-8"
                            >
                              Batal
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleClaim(reward)}
                              disabled={claimingId === reward.id}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8"
                            >
                              {claimingId === reward.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Yakin!"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setConfirmRewardId(reward.id)}
                            disabled={!canAfford || isOutOfStock || claimingId !== null}
                            className={cn(
                              "text-xs h-8 gap-1.5",
                              canAfford && !isOutOfStock
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                          >
                            <CoinIcon className="h-3.5 w-3.5" />
                            {isOutOfStock ? "Habis" : !canAfford ? "Koin Kurang" : "Tukar"}
                          </Button>
                        )}
                      </div>

                      {!canAfford && !isOutOfStock && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle className="w-3 h-3" />
                          Kurang {reward.coin_cost - balance} koin lagi
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Claims History */}
      {activeTab === "history" && (
        <>
          {claims.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada riwayat klaim</h3>
              <p className="text-gray-400 text-sm mt-1">Tukarkan koin kamu untuk mendapatkan hadiah</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="divide-y">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden">
                      {claim.reward?.image ? (
                        <Image
                          src={claim.reward.image.startsWith("http") ? claim.reward.image : getUploadUrl(claim.reward.image)}
                          alt={claim.reward?.name || "Hadiah"}
                          fill
                          className="object-cover"
                          sizes="48px" />
                      ) : (
                        <Gift className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900">{claim.reward?.name || "Hadiah"}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(claim.claimed_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-700 shrink-0">
                      <span>-{claim.coin_spent}</span>
                      <CoinIcon className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <section className="mt-8 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Creative Reward Loop</p>
        <h4 className="font-semibold text-gray-900 mt-1">Aktifkan reward lewat perilaku kreatif harian</h4>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {creativeRewardActions.map((action) => (
            <Link key={action.key} href={action.href} className="rounded-xl border border-violet-200 bg-white p-3 hover:bg-violet-100 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 grid place-items-center">
                <action.icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-2">{action.title}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{action.description}</p>
              <span className="text-[11px] font-semibold text-violet-700 mt-2 inline-flex items-center gap-1">
                Jalankan
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <CoinIcon className="h-5 w-5" />
          Cara Mendapatkan Koin Emas
        </h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Selesaikan <strong>misi harian</strong> untuk mendapatkan koin emas</li>
          <li>• Login setiap hari: <strong>+1 koin</strong></li>
          <li>• Chat AI, tulis jurnal, baca artikel, dan aktivitas lainnya</li>
          <li>• Kumpulkan koin, klaim hadiah, lalu <strong>aktifkan manfaatnya</strong> langsung</li>
        </ul>
      </div>
    </div>
  );
}
