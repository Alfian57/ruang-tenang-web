"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Loader2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils";
import { communityService } from "@/services/api";
import type { LevelConfig } from "@/types";

interface LevelTierGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLevel?: number;
}

interface TierGroup {
    tierName: string;
    tierColor: string;
    levels: LevelConfig[];
}

const TIER_GRADIENTS: Record<string, string> = {
    gray: "from-gray-400 to-gray-500",
    blue: "from-blue-400 to-blue-600",
    green: "from-emerald-400 to-emerald-600",
    purple: "from-purple-400 to-purple-600",
    gold: "from-yellow-400 to-amber-500",
};

const TIER_BG: Record<string, string> = {
    gray: "bg-gray-50 border-gray-200",
    blue: "bg-blue-50/50 border-blue-200",
    green: "bg-emerald-50/50 border-emerald-200",
    purple: "bg-purple-50/50 border-purple-200",
    gold: "bg-amber-50/50 border-amber-300",
};

const TIER_BADGE_RING: Record<string, string> = {
    gray: "ring-gray-300",
    blue: "ring-blue-300",
    green: "ring-emerald-300",
    purple: "ring-purple-300",
    gold: "ring-amber-400",
};

const TIER_TEXT: Record<string, string> = {
    gray: "text-gray-700",
    blue: "text-blue-700",
    green: "text-emerald-700",
    purple: "text-purple-700",
    gold: "text-amber-700",
};

const TIER_DESCRIPTIONS: Record<string, string> = {
    Newcomer: "Awal perjalanan menuju kesehatan mental yang lebih baik",
    Explorer: "Menjelajahi berbagai fitur dan mulai berkembang",
    Trusted: "Anggota terpercaya yang aktif di komunitas",
    Veteran: "Berpengalaman dan menginspirasi sesama",
    Guardian: "Penjaga komunitas dengan dedikasi tinggi",
};

function formatExp(exp: number): string {
    if (exp >= 1000) {
        return `${(exp / 1000).toFixed(exp % 1000 === 0 ? 0 : 1)}K`;
    }
    return exp.toLocaleString("id-ID");
}

export function LevelTierGuideModal({
    isOpen,
    onClose,
    currentLevel,
}: LevelTierGuideModalProps) {
    const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedTier, setExpandedTier] = useState<string | null>(null);

    const fetchLevelConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await communityService.getLevelConfigs();
            const configs = (response.data ?? []) as LevelConfig[];
            setLevelConfigs(configs.sort((a, b) => a.level - b.level));
        } catch {
            setLevelConfigs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && levelConfigs.length === 0) {
            fetchLevelConfigs();
        }
    }, [isOpen, levelConfigs.length, fetchLevelConfigs]);

    // Auto-expand the tier that contains the current level
    useEffect(() => {
        if (currentLevel && levelConfigs.length > 0) {
            const currentConfig = levelConfigs.find((c) => c.level === currentLevel);
            if (currentConfig?.tier_name) {
                setExpandedTier(currentConfig.tier_name);
            }
        }
    }, [currentLevel, levelConfigs]);

    if (!isOpen) return null;

    // Group levels by tier
    const tierGroups = groupByTier(levelConfigs);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="relative overflow-hidden px-6 pt-6 pb-4 border-b bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">🎖️</span>
                                Panduan Level & Tier
                            </h2>
                            <p className="text-white/80 text-sm mt-1">
                                Kumpulkan EXP untuk naik level dan raih badge baru!
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        </div>
                    ) : levelConfigs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Info className="h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500">Data level belum tersedia</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Current level indicator */}
                            {currentLevel && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-200 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-sm text-indigo-700 font-medium">
                                        Level kamu saat ini: <strong>Level {currentLevel}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Tier groups */}
                            {tierGroups.map((group) => {
                                const isExpanded = expandedTier === group.tierName;
                                const tierColor = group.tierColor || "gray";
                                const hasCurrentLevel = group.levels.some(
                                    (l) => l.level === currentLevel
                                );

                                return (
                                    <div
                                        key={group.tierName}
                                        className={cn(
                                            "rounded-xl border-2 overflow-hidden transition-all duration-200",
                                            TIER_BG[tierColor] || TIER_BG.gray,
                                            hasCurrentLevel && "ring-2 ring-indigo-300 ring-offset-1"
                                        )}
                                    >
                                        {/* Tier Header */}
                                        <button
                                            onClick={() =>
                                                setExpandedTier(isExpanded ? null : group.tierName)
                                            }
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl bg-linear-to-br flex items-center justify-center text-white font-bold text-sm shadow-md",
                                                        TIER_GRADIENTS[tierColor] || TIER_GRADIENTS.gray
                                                    )}
                                                >
                                                    {getTierIcon(group.tierName)}
                                                </div>
                                                <div className="text-left">
                                                    <h3
                                                        className={cn(
                                                            "font-bold text-base",
                                                            TIER_TEXT[tierColor] || TIER_TEXT.gray
                                                        )}
                                                    >
                                                        {group.tierName}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {TIER_DESCRIPTIONS[group.tierName] ||
                                                            `${group.levels.length} level`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-400">
                                                    Lv {group.levels[0].level}
                                                    {group.levels.length > 1 &&
                                                        `–${group.levels[group.levels.length - 1].level}`}
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Level cards */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-2">
                                                {group.levels.map((config) => {
                                                    const nextConfig = levelConfigs.find(
                                                        (c) => c.level === config.level + 1
                                                    );
                                                    const maxExp = nextConfig
                                                        ? nextConfig.min_exp - 1
                                                        : null;
                                                    const isCurrent = config.level === currentLevel;
                                                    const isPast = currentLevel
                                                        ? config.level < currentLevel
                                                        : false;
                                                    const isFuture = currentLevel
                                                        ? config.level > currentLevel
                                                        : false;

                                                    return (
                                                        <div
                                                            key={config.id}
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                                                                isCurrent
                                                                    ? "bg-white shadow-md border-2 border-indigo-300 scale-[1.01]"
                                                                    : isPast
                                                                        ? "bg-white/60 border border-transparent"
                                                                        : "bg-white/40 border border-transparent"
                                                            )}
                                                        >
                                                            {/* Badge icon */}
                                                            <div className="relative shrink-0">
                                                                <div
                                                                    className={cn(
                                                                        "w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-offset-1 overflow-hidden",
                                                                        isCurrent
                                                                            ? "ring-indigo-400"
                                                                            : TIER_BADGE_RING[tierColor] ||
                                                                            TIER_BADGE_RING.gray,
                                                                        isFuture && "opacity-50 grayscale"
                                                                    )}
                                                                >
                                                                    {config.badge_icon ? (
                                                                        <Image
                                                                            src={config.badge_icon}
                                                                            alt={config.badge_name}
                                                                            width={48}
                                                                            height={48}
                                                                            className="w-full h-full object-contain p-0.5"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xl">🎖️</span>
                                                                    )}
                                                                </div>
                                                                {isCurrent && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                                    </div>
                                                                )}
                                                                {isPast && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                                        <svg
                                                                            className="w-2.5 h-2.5 text-white"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                            strokeWidth={3}
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M5 13l4 4L19 7"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Level info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={cn(
                                                                            "text-xs font-bold px-1.5 py-0.5 rounded",
                                                                            isCurrent
                                                                                ? "bg-indigo-100 text-indigo-700"
                                                                                : isPast
                                                                                    ? "bg-green-100 text-green-700"
                                                                                    : "bg-gray-100 text-gray-500"
                                                                        )}
                                                                    >
                                                                        Lv {config.level}
                                                                    </span>
                                                                    <span
                                                                        className={cn(
                                                                            "font-semibold text-sm truncate",
                                                                            isCurrent
                                                                                ? "text-indigo-900"
                                                                                : isFuture
                                                                                    ? "text-gray-400"
                                                                                    : "text-gray-700"
                                                                        )}
                                                                    >
                                                                        {config.badge_name}
                                                                    </span>
                                                                </div>
                                                                {config.description && (
                                                                    <p
                                                                        className={cn(
                                                                            "text-xs mt-0.5 truncate",
                                                                            isFuture
                                                                                ? "text-gray-300"
                                                                                : "text-gray-500"
                                                                        )}
                                                                    >
                                                                        {config.description}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* EXP range */}
                                                            <div className="text-right shrink-0">
                                                                <p
                                                                    className={cn(
                                                                        "text-xs font-bold",
                                                                        isCurrent
                                                                            ? "text-indigo-600"
                                                                            : isFuture
                                                                                ? "text-gray-300"
                                                                                : "text-gray-500"
                                                                    )}
                                                                >
                                                                    {formatExp(config.min_exp)} EXP
                                                                </p>
                                                                <p
                                                                    className={cn(
                                                                        "text-[10px]",
                                                                        isFuture
                                                                            ? "text-gray-300"
                                                                            : "text-gray-400"
                                                                    )}
                                                                >
                                                                    {maxExp
                                                                        ? `s/d ${formatExp(maxExp)}`
                                                                        : "& seterusnya"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* XP earning tips */}
                            <div className="mt-4 px-4 py-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                                <h4 className="font-semibold text-amber-800 text-sm flex items-center gap-2 mb-2">
                                    <span>💡</span> Cara Mendapatkan EXP
                                </h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                    <ExpTip label="Chat AI" value="+10" />
                                    <ExpTip label="Upload Artikel" value="+20" />
                                    <ExpTip label="Komentar Forum" value="+5" />
                                    <ExpTip label="Latihan Nafas" value="+5" />
                                    <ExpTip label="Jawaban Diterima" value="+30" />
                                    <ExpTip label="Cerita Disetujui" value="+50" />
                                    <ExpTip label="Dapat Upvote" value="+5" />
                                    <ExpTip label="Dapat Heart" value="+2" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ExpTip({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-amber-700">{label}</span>
            <span className="font-bold text-amber-600">{value}</span>
        </div>
    );
}

function getTierIcon(tierName: string): string {
    switch (tierName) {
        case "Newcomer":
            return "🌱";
        case "Explorer":
            return "🧭";
        case "Trusted":
            return "🛡️";
        case "Veteran":
            return "⚔️";
        case "Guardian":
            return "👑";
        default:
            return "🎖️";
    }
}

function groupByTier(configs: LevelConfig[]): TierGroup[] {
    const groups: TierGroup[] = [];
    const groupMap = new Map<string, TierGroup>();

    for (const config of configs) {
        const tierName = config.tier_name || config.badge_name || `Level ${config.level}`;
        const tierColor = config.tier_color || "gray";

        if (!groupMap.has(tierName)) {
            const group: TierGroup = { tierName, tierColor, levels: [] };
            groupMap.set(tierName, group);
            groups.push(group);
        }
        groupMap.get(tierName)!.levels.push(config);
    }

    return groups;
}
