"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Lock, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/CoinIcon";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { communityService, progressMapService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { FullMapResponse, LevelConfig, MapLandmark, MapRegion } from "@/types";
import { cn } from "@/utils";
import { toast } from "sonner";

const timelineContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
        },
    },
};

const timelineItemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
        },
    },
};

interface TierGroup {
    tierName: string;
    tierColor: string;
    levels: LevelConfig[];
    minLevel: number;
    maxLevel: number;
    minExp: number;
    maxExp: number | null;
}

interface TierLandmarkItem {
    regionKey: string;
    regionName: string;
    regionOrder: number;
    landmark: MapLandmark;
}

function formatExp(exp: number): string {
    if (exp >= 1000) {
        return `${(exp / 1000).toFixed(exp % 1000 === 0 ? 0 : 1)}K`;
    }
    return exp.toLocaleString("id-ID");
}

function buildTierGroups(configs: LevelConfig[]): TierGroup[] {
    const sorted = [...configs].sort((a, b) => a.level - b.level);
    const groups: TierGroup[] = [];

    for (const cfg of sorted) {
        const tierName = cfg.tier_name || cfg.badge_name || `Tier Level ${cfg.level}`;
        const tierColor = cfg.tier_color || "#64748b";

        const existing = groups.find((g) => g.tierName === tierName);
        if (!existing) {
            groups.push({
                tierName,
                tierColor,
                levels: [cfg],
                minLevel: cfg.level,
                maxLevel: cfg.level,
                minExp: cfg.min_exp,
                maxExp: null,
            });
            continue;
        }

        existing.levels.push(cfg);
        existing.maxLevel = Math.max(existing.maxLevel, cfg.level);
        existing.minLevel = Math.min(existing.minLevel, cfg.level);
        existing.minExp = Math.min(existing.minExp, cfg.min_exp);
    }

    for (const group of groups) {
        const lastLevelConfig = sorted.find((item) => item.level === group.maxLevel);
        const nextLevelConfig = sorted.find((item) => item.level === group.maxLevel + 1);
        if (lastLevelConfig && nextLevelConfig) {
            group.maxExp = nextLevelConfig.min_exp - 1;
        } else {
            group.maxExp = null;
        }
    }

    return groups.sort((a, b) => a.minLevel - b.minLevel);
}

function formatActivityName(activity?: string): string {
    if (!activity) return "aktivitas";

    const lookup: Record<string, string> = {
        login: "Login",
        mood: "Catat Mood",
        chat: "Chat AI",
        breathing: "Sesi Pernapasan",
        article: "Baca Artikel",
        write_article: "Tulis Artikel",
        journal: "Jurnal",
        forum: "Posting Forum",
        story: "Cerita Inspirasi",
    };

    return lookup[activity] || activity.replaceAll("_", " ");
}

function formatUnlockCriteria(landmark: MapLandmark): string {
    switch (landmark.unlock_type) {
        case "activity_count":
            return `${formatActivityName(landmark.unlock_activity)} ${landmark.unlock_value}x`;
        case "streak":
            return `Streak ${landmark.unlock_value} hari`;
        case "xp":
            return `Kumpulkan ${formatExp(landmark.unlock_value)} EXP`;
        case "level":
            return `Capai Level ${landmark.unlock_value}`;
        default:
            return `Target ${landmark.unlock_value}`;
    }
}

function buildTierLandmarks(tier: TierGroup, regions: MapRegion[]): TierLandmarkItem[] {
    return regions
        .filter(
            (region) =>
                region.unlock_type === "level" &&
                region.unlock_value >= tier.minLevel &&
                region.unlock_value <= tier.maxLevel
        )
        .flatMap((region) =>
            region.landmarks.map((landmark) => ({
                regionKey: region.region_key,
                regionName: region.name,
                regionOrder: region.display_order,
                landmark,
            }))
        )
        .sort((a, b) => {
            if (a.regionOrder !== b.regionOrder) {
                return a.regionOrder - b.regionOrder;
            }
            return a.landmark.position_x - b.landmark.position_x;
        });
}

export function TierJourneySection() {
    const { user, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
    const [mapData, setMapData] = useState<FullMapResponse | null>(null);
    const [selectedTier, setSelectedTier] = useState<TierGroup | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [claimingLandmark, setClaimingLandmark] = useState<string | null>(null);
    const [celebratingLandmarkId, setCelebratingLandmarkId] = useState<string | null>(null);
    const celebrateTimerRef = useRef<number | null>(null);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        return () => {
            if (celebrateTimerRef.current) {
                window.clearTimeout(celebrateTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            try {
                const [tierResponse, mapResponse] = await Promise.all([
                    communityService.getLevelConfigs(),
                    token ? progressMapService.getFullMap(token) : Promise.resolve(null),
                ]);
                if (!mounted) return;
                setLevelConfigs(Array.isArray(tierResponse.data) ? tierResponse.data : []);
                setMapData(mapResponse?.data ?? null);
            } catch {
                if (!mounted) return;
                setLevelConfigs([]);
                setMapData(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [token]);

    const tierGroups = useMemo(() => buildTierGroups(levelConfigs), [levelConfigs]);
    const tierLandmarks = useMemo(() => {
        if (!selectedTier || !mapData) return [];
        return buildTierLandmarks(selectedTier, mapData.regions);
    }, [selectedTier, mapData]);
    const currentLevel = user?.level ?? 1;
    const currentExp = user?.exp ?? 0;
    const nextLockedTier = tierGroups.find((tier) => currentLevel < tier.minLevel);

    const handleOpenTier = (tier: TierGroup) => {
        setSelectedTier(tier);
        setIsModalOpen(true);
    };

    const handleClaimReward = async (landmarkId: string) => {
        if (!token || claimingLandmark) return;

        setClaimingLandmark(landmarkId);
        try {
            await progressMapService.claimLandmarkReward(token, landmarkId);
            toast.success("Reward berhasil diklaim");
            if (!prefersReducedMotion) {
                setCelebratingLandmarkId(landmarkId);
                if (celebrateTimerRef.current) {
                    window.clearTimeout(celebrateTimerRef.current);
                }
                celebrateTimerRef.current = window.setTimeout(() => {
                    setCelebratingLandmarkId(null);
                }, 1100);
            }
            const refreshedMap = await progressMapService.getFullMap(token);
            setMapData(refreshedMap.data);
        } catch {
            toast.error("Gagal mengklaim reward");
        } finally {
            setClaimingLandmark(null);
        }
    };

    return (
        <section className="space-y-4">
            <div
                className="rounded-3xl border p-4 md:p-6 shadow-xs"
                style={{
                    borderColor: "var(--theme-accent-border)",
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-light) 50%, white), white 40%, color-mix(in srgb, var(--theme-accent-soft) 65%, white))",
                }}
            >
                <div className="flex items-start gap-3">
                    <div
                        className="h-11 w-11 shrink-0 rounded-2xl text-white grid place-items-center shadow-md"
                        style={{ background: "linear-gradient(135deg, var(--theme-fab-from), var(--theme-fab-to))" }}
                    >
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-900">Journey Berdasarkan Tier</h2>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            Progress journey kamu bersifat dinamis berdasarkan tier. Naik level untuk membuka tier berikutnya dan klaim hadiah lebih besar.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2.5">
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                    backgroundColor: "var(--theme-accent-light)",
                                    borderColor: "var(--theme-accent-border)",
                                    color: "var(--theme-accent-dark)",
                                }}
                            >
                                <Target className="h-3.5 w-3.5" />
                                Level Saat Ini: {currentLevel}
                            </span>
                            <span
                                className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                    backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, white)",
                                    borderColor: "color-mix(in srgb, var(--color-primary) 24%, white)",
                                    color: "color-mix(in srgb, var(--color-primary) 78%, black)",
                                }}
                            >
                                EXP: {formatExp(currentExp)}
                            </span>
                            {nextLockedTier && (
                                <span
                                    className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                    style={{
                                        backgroundColor: "var(--theme-accent-soft)",
                                        borderColor: "var(--theme-accent-border)",
                                        color: "var(--theme-accent-text)",
                                    }}
                                >
                                    Next Unlock: Level {nextLockedTier.minLevel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-white/70 bg-white/80 p-10 flex items-center justify-center shadow-xs">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : tierGroups.length === 0 ? (
                <div className="rounded-2xl border border-white/70 bg-white/80 p-10 text-center text-sm text-gray-500 shadow-xs">
                    Data tier belum tersedia.
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="sticky top-2 z-10">
                        <div className="rounded-2xl border border-white/70 bg-white/85 backdrop-blur-md shadow-xs px-3 py-2.5 md:px-4">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px] font-semibold">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Selesai
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 px-2 py-1">
                                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                                    Aktif
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1">
                                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                                    Terkunci
                                </span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        className="relative py-1"
                        variants={timelineContainerVariants}
                        initial={prefersReducedMotion ? undefined : "hidden"}
                        animate={prefersReducedMotion ? undefined : "show"}
                    >
                        <div
                            className="absolute left-6 top-0 bottom-0 w-1.5 rounded-full md:left-1/2 md:-translate-x-1/2"
                            style={{
                                background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-fab-from) 80%, white), var(--color-primary), var(--theme-accent))",
                            }}
                            aria-hidden="true"
                        />

                        {tierGroups.map((tier, index) => {
                            const isCurrentTier = currentLevel >= tier.minLevel && currentLevel <= tier.maxLevel;
                            const isCompletedTier = currentLevel > tier.maxLevel;
                            const isLockedTier = currentLevel < tier.minLevel;
                            const isRightSide = index % 2 === 0;

                            const progressPercent = (() => {
                                if (isCompletedTier) return 100;
                                if (isLockedTier) return 0;
                                const maxExp = tier.maxExp ?? currentExp;
                                const denominator = Math.max(1, maxExp - tier.minExp + 1);
                                const progress = ((currentExp - tier.minExp + 1) / denominator) * 100;
                                return Math.min(100, Math.max(0, progress));
                            })();

                            const featuredBadge = tier.levels[tier.levels.length - 1];
                            const statusLabel = isCompletedTier
                                ? "Tier selesai"
                                : isCurrentTier
                                    ? "Tier aktif"
                                    : `Terkunci (butuh Level ${tier.minLevel})`;
                            const statusClass = isCompletedTier
                                ? "bg-emerald-100 text-emerald-700"
                                : isCurrentTier
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-gray-100 text-gray-600";

                            return (
                                <motion.div
                                    key={`${tier.tierName}-${tier.minLevel}`}
                                    variants={prefersReducedMotion ? undefined : timelineItemVariants}
                                    className="relative mb-6 last:mb-0 pl-14 md:pl-0"
                                >
                                    <div
                                        className="absolute left-6 top-6 h-5 w-5 -translate-x-1/2 rounded-full border-3 border-white shadow-md md:left-1/2"
                                        style={{ backgroundColor: isLockedTier ? "#cbd5e1" : tier.tierColor }}
                                        aria-hidden="true"
                                    />

                                    {isCurrentTier && (
                                        <>
                                            <div
                                                className={cn(
                                                    "absolute left-6 top-6 h-5 w-5 -translate-x-1/2 rounded-full md:left-1/2",
                                                    !prefersReducedMotion && "animate-ping"
                                                )}
                                                style={{ backgroundColor: `${tier.tierColor}66` }}
                                                aria-hidden="true"
                                            />
                                            <div
                                                className="absolute left-6 top-6 h-8 w-8 -translate-x-1/2 -translate-y-1.5 rounded-full md:left-1/2"
                                                style={{ boxShadow: `0 0 0 1px ${tier.tierColor}30` }}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}

                                    {!isLockedTier && (
                                        <div
                                            className="absolute left-6 top-6 h-5 w-5 -translate-x-1/2 rounded-full blur-sm opacity-50 md:left-1/2"
                                            style={{ backgroundColor: tier.tierColor }}
                                            aria-hidden="true"
                                        />
                                    )}

                                    {isCompletedTier && !prefersReducedMotion && (
                                        <>
                                            <motion.span
                                                className="pointer-events-none absolute left-6 top-2.5 md:left-1/2 text-amber-500"
                                                initial={{ opacity: 0, y: 2, scale: 0.8 }}
                                                animate={{ opacity: [0, 1, 0], y: [2, -8, -14], scale: [0.8, 1, 0.85] }}
                                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.2, delay: 0.05 }}
                                                aria-hidden="true"
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                            </motion.span>
                                            <motion.span
                                                className="pointer-events-none absolute left-9 top-6 md:left-[calc(50%+12px)] text-amber-400"
                                                initial={{ opacity: 0, y: 1, scale: 0.75 }}
                                                animate={{ opacity: [0, 0.9, 0], y: [1, -6, -10], scale: [0.75, 0.95, 0.75] }}
                                                transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 0.95, delay: 0.35 }}
                                                aria-hidden="true"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                            </motion.span>
                                        </>
                                    )}

                                    {/* Checkpoint marker */}
                                    {index < tierGroups.length - 1 && (
                                        <div className="absolute left-6 -bottom-4 -translate-x-1/2 md:left-1/2" aria-hidden="true">
                                            <div className="h-2.5 w-2.5 rotate-45 rounded-xs border border-white bg-slate-300/90 shadow-sm" />
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            "w-full md:w-[calc(50%-2.8rem)]",
                                            isRightSide ? "md:ml-auto" : "md:mr-auto"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "hidden md:block absolute top-8 h-px w-8 bg-slate-300/80",
                                                isRightSide ? "right-[calc(50%+10px)]" : "left-[calc(50%+10px)]"
                                            )}
                                            aria-hidden="true"
                                        />

                                        <motion.div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleOpenTier(tier)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    handleOpenTier(tier);
                                                }
                                            }}
                                            className={cn(
                                                "group rounded-2xl border border-white/75 bg-white/90 backdrop-blur-md p-3.5 md:p-5 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5",
                                                isCurrentTier && "ring-2 ring-offset-1"
                                            )}
                                            whileHover={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : {
                                                        y: -4,
                                                        rotateX: 1.2,
                                                        rotateY: isRightSide ? -1.8 : 1.8,
                                                        transition: { duration: 0.22 },
                                                    }
                                            }
                                            style={{
                                                ...(isCurrentTier
                                                    ? ({
                                                        borderColor: tier.tierColor,
                                                        ["--tw-ring-color" as string]: `${tier.tierColor}55`,
                                                    } as React.CSSProperties)
                                                    : {}),
                                                transformPerspective: 950,
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-50 border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                                    {featuredBadge?.badge_icon ? (
                                                        <Image
                                                            src={featuredBadge.badge_icon}
                                                            alt={featuredBadge.badge_name}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full object-contain p-1.5"
                                                        />
                                                    ) : (
                                                        <Trophy className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span
                                                            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                                                            style={{ color: tier.tierColor, backgroundColor: `${tier.tierColor}1A` }}
                                                        >
                                                            {tier.tierName}
                                                        </span>
                                                        <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full", statusClass)}>
                                                            {statusLabel}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700 mt-2">
                                                        Level {tier.minLevel}{tier.maxLevel !== tier.minLevel ? ` - ${tier.maxLevel}` : ""}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        EXP {formatExp(tier.minExp)}{tier.maxExp ? ` - ${formatExp(tier.maxExp)}` : "+"}
                                                    </p>

                                                    <div className="mt-3 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: tier.tierColor }}
                                                            initial={prefersReducedMotion ? undefined : { width: 0 }}
                                                            whileInView={prefersReducedMotion ? undefined : { width: `${progressPercent}%` }}
                                                            animate={prefersReducedMotion ? { width: `${progressPercent}%` } : undefined}
                                                            viewport={{ once: true, amount: 0.7 }}
                                                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                        <Target className="h-3 w-3" />
                                                        Progres Tier: {Math.round(progressPercent)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent
                    className="max-w-2xl rounded-2xl border bg-white/96 backdrop-blur-md p-0 overflow-hidden"
                    style={{ borderColor: "var(--theme-accent-border-soft)" }}
                >
                    <DialogHeader
                        className="px-6 pt-6 pb-4 border-b"
                        style={{
                            borderColor: "var(--theme-accent-border-soft)",
                            background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-light) 48%, white), white)",
                        }}
                    >
                        <DialogTitle className="text-slate-900 font-black tracking-tight">
                            {selectedTier ? `Klaim Hadiah ${selectedTier.tierName}` : "Klaim Hadiah Tier"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 leading-relaxed">
                            Kriteria tugas dan hadiah diambil dinamis dari konfigurasi backend. Admin bisa mengubah target aktivitas, EXP, dan koin tanpa hardcode frontend.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 max-h-[58vh] overflow-y-auto p-4 md:p-5">
                        {!selectedTier || tierLandmarks.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-5 text-sm text-slate-500 bg-slate-50/50">
                                Belum ada konfigurasi tugas untuk tier ini.
                            </div>
                        ) : (
                            tierLandmarks.map((item) => {
                                const criteria = formatUnlockCriteria(item.landmark);
                                const progressText = `${Math.min(item.landmark.current_value, item.landmark.unlock_value)}/${item.landmark.unlock_value}`;
                                const hasReachedTarget = item.landmark.current_value >= item.landmark.unlock_value;
                                const isClaimable = item.landmark.is_unlocked && hasReachedTarget && !item.landmark.reward_claimed;
                                const isClaimed = item.landmark.reward_claimed;

                                const statusLabel = isClaimed
                                    ? "Sudah diklaim"
                                    : isClaimable
                                        ? "Siap diklaim"
                                        : "Belum terbuka";

                                const statusStyle = isClaimed
                                    ? {
                                        backgroundColor: "color-mix(in srgb, #16a34a 14%, white)",
                                        borderColor: "color-mix(in srgb, #16a34a 30%, white)",
                                        color: "#166534",
                                    }
                                    : isClaimable
                                        ? {
                                            backgroundColor: "var(--theme-accent-light)",
                                            borderColor: "var(--theme-accent-border)",
                                            color: "var(--theme-accent-dark)",
                                        }
                                        : {
                                            backgroundColor: "#f3f4f6",
                                            borderColor: "#e5e7eb",
                                            color: "#6b7280",
                                        };

                                return (
                                    <div
                                        key={item.landmark.id}
                                        className="relative overflow-hidden rounded-2xl border p-3.5 md:p-4 bg-white shadow-sm"
                                        style={{
                                            borderColor: "color-mix(in srgb, var(--theme-accent-border) 45%, #e5e7eb)",
                                            background: "linear-gradient(180deg, #ffffff, color-mix(in srgb, var(--theme-accent-soft) 22%, white))",
                                        }}
                                    >
                                        {celebratingLandmarkId === item.landmark.id && !prefersReducedMotion && (
                                            <>
                                                {[0, 1, 2, 3, 4, 5, 6, 7].map((particle) => {
                                                    const x = [0, 20, -22, 30, -28, 14, -14, 6][particle];
                                                    const y = [-8, -20, -18, -26, -24, -30, -28, -34][particle];
                                                    const rotate = [0, 24, -32, 44, -48, 62, -66, 86][particle];
                                                    const color = [
                                                        "var(--theme-accent)",
                                                        "var(--color-primary)",
                                                        "var(--theme-fab-to)",
                                                        "var(--theme-fab-from)",
                                                        "var(--theme-accent-dark)",
                                                        "var(--theme-accent)",
                                                        "var(--color-primary)",
                                                        "var(--theme-fab-to)",
                                                    ][particle];

                                                    return (
                                                        <motion.span
                                                            key={`${item.landmark.id}-burst-${particle}`}
                                                            className="pointer-events-none absolute right-7 top-8 h-2 w-2 rounded-xs"
                                                            style={{ backgroundColor: color }}
                                                            initial={{ opacity: 0.95, scale: 0.9, x: 0, y: 0, rotate: 0 }}
                                                            animate={{ opacity: 0, scale: 0.35, x, y, rotate }}
                                                            transition={{ duration: 0.62, ease: "easeOut", delay: particle * 0.02 }}
                                                            aria-hidden="true"
                                                        />
                                                    );
                                                })}
                                            </>
                                        )}

                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 mb-1">{item.regionName}</p>
                                                <h4 className="font-semibold text-slate-900 wrap-break-word">
                                                    {item.landmark.name}
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.landmark.description}</p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div
                                                    className="inline-flex items-center gap-2 rounded-full text-xs px-2 py-1 border"
                                                    style={{
                                                        backgroundColor: "var(--theme-accent-light)",
                                                        color: "var(--theme-accent-dark)",
                                                        borderColor: "var(--theme-accent-border)",
                                                    }}
                                                >
                                                    <Zap className="h-3.5 w-3.5" />
                                                    +{item.landmark.xp_reward} EXP
                                                </div>
                                                <div
                                                    className="inline-flex items-center gap-2 rounded-full text-xs px-2 py-1 mt-1 border"
                                                    style={{
                                                        backgroundColor: "var(--theme-accent-soft)",
                                                        color: "var(--theme-accent-text)",
                                                        borderColor: "var(--theme-accent-border)",
                                                    }}
                                                >
                                                    <CoinIcon className="h-3.5 w-3.5 drop-shadow-none contrast-100 saturate-100 brightness-100" alt="Gold coin" />
                                                    +{item.landmark.coin_reward} Gold
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <p className="text-xs text-gray-500">Kriteria: {criteria}</p>
                                                <p className="text-xs text-gray-500">Progress: {progressText}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isClaimable ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleClaimReward(item.landmark.id)}
                                                        disabled={claimingLandmark === item.landmark.id}
                                                        isLoading={claimingLandmark === item.landmark.id}
                                                        loadingText="Mengklaim..."
                                                        className="min-w-31 text-white"
                                                        style={{ background: "linear-gradient(135deg, var(--theme-fab-from), var(--theme-fab-to))" }}
                                                    >
                                                        Klaim Hadiah
                                                    </Button>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold select-none cursor-default"
                                                        style={statusStyle}
                                                        aria-live="polite"
                                                    >
                                                        {isClaimed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                                        {statusLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
