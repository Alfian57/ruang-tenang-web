"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Loader2, Info } from "lucide-react";
import { cn } from "@/utils";
import { communityService } from "@/services/api";
import type { LevelConfig } from "@/types";

interface LevelTierGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLevel?: number;
}

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-gray-50 rounded-3xl shadow-2xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header — uses dynamic theme color */}
                <div 
                    className="relative overflow-hidden px-8 pt-8 pb-6 shrink-0"
                    style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary, var(--color-primary)))` }}
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-20" />
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="text-3xl filter drop-shadow-md">🎖️</span>
                                Panduan Level & Tier
                            </h2>
                            <p className="text-white/90 text-sm mt-1.5 font-medium">
                                Kumpulkan EXP untuk naik level dan raih badge baru!
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 transition-colors text-white backdrop-blur-sm self-start"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content — flat list of all levels */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-10 scrollbar-thin scrollbar-thumb-gray-300">
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--color-primary)" }} />
                        </div>
                    ) : levelConfigs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Info className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Data level belum tersedia</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Current level indicator */}
                            {currentLevel && (
                                <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" 
                                        style={{ backgroundColor: "var(--color-primary)" }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Level kamu saat ini: <strong className="px-2.5 py-1 rounded-md ml-1" style={{ color: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}>Level {currentLevel}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Flat level list */}
                            <div className="space-y-3">
                                {levelConfigs.map((config) => {
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
                                                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border",
                                                isCurrent
                                                    ? "shadow-md ring-1 ring-offset-1"
                                                    : isPast
                                                        ? "bg-gray-50/80 border-transparent hover:bg-gray-50"
                                                        : "bg-white border-gray-200 hover:bg-gray-50/50 hover:border-gray-300 shadow-sm"
                                            )}
                                            style={isCurrent ? { 
                                                backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)", 
                                                borderColor: "var(--color-primary)", 
                                                "--tw-ring-color": "var(--color-primary)" 
                                            } as React.CSSProperties : {}}
                                        >
                                            {/* Badge icon */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={cn(
                                                        "w-14 h-14 rounded-full flex items-center justify-center ring-2 overflow-hidden shadow-sm bg-white",
                                                        !isCurrent && "ring-gray-200 ring-offset-2",
                                                        isCurrent && "ring-offset-2",
                                                        isFuture && "opacity-60 grayscale"
                                                    )}
                                                    style={isCurrent ? { "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties : {}}
                                                >
                                                    {config.badge_icon ? (
                                                        <Image
                                                            src={config.badge_icon}
                                                            alt={config.badge_name}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full object-contain p-1.5"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">🎖️</span>
                                                    )}
                                                </div>
                                                {isCurrent && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-white" style={{ backgroundColor: "var(--color-primary)" }}>
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    </div>
                                                )}
                                                {isPast && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={3.5}
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
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className="flex items-center gap-2.5 mb-1">
                                                    <span
                                                        className={cn(
                                                            "text-xs font-bold px-2 py-0.5 rounded-md leading-none",
                                                            isPast ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                        )}
                                                        style={isCurrent ? { color: "var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)" } : {}}
                                                    >
                                                        Lv {config.level}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "font-bold text-base truncate",
                                                            isFuture ? "text-gray-400" : "text-gray-800"
                                                        )}
                                                        style={isCurrent ? { color: "var(--color-primary)" } : {}}
                                                    >
                                                        {config.badge_name}
                                                    </span>
                                                </div>
                                                <p
                                                    className={cn(
                                                        "text-sm truncate",
                                                        isFuture ? "text-gray-400" : "text-gray-500"
                                                    )}
                                                >
                                                    {config.description || "Terus kumpulkan EXP untuk level ini"}
                                                </p>
                                            </div>

                                            {/* EXP range */}
                                            <div className="text-right shrink-0">
                                                <p
                                                    className={cn(
                                                        "text-[15px] font-bold tracking-tight",
                                                        isFuture ? "text-gray-400" : "text-gray-700"
                                                    )}
                                                    style={isCurrent ? { color: "var(--color-primary)" } : {}}
                                                >
                                                    {formatExp(config.min_exp)} XP
                                                </p>
                                                <p
                                                    className={cn(
                                                        "text-xs font-medium mt-0.5",
                                                        isFuture ? "text-gray-300" : "text-gray-400"
                                                    )}
                                                >
                                                    {maxExp ? `s/d ${formatExp(maxExp)}` : "Max"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* XP earning tips */}
                            <div className="mt-8 relative overflow-hidden rounded-2xl border p-5 shadow-inner bg-gray-50/80 border-gray-200">
                                <div className="absolute right-0 bottom-0 text-7xl opacity-5 translate-x-4 translate-y-4 pointer-events-none">💡</div>
                                <h4 className="font-bold flex items-center gap-2 mb-3 text-gray-700">
                                    <span className="text-lg">💡</span> Cara Mendapatkan EXP
                                </h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 relative z-10 w-full sm:w-11/12">
                                    <ExpTip label="Chat Teman Cerita AI" value="+10" />
                                    <ExpTip label="Tulis Jurnal Harian" value="+15" />
                                    <ExpTip label="Komentar Forum" value="+5" />
                                    <ExpTip label="Latihan Nafas" value="+5" />
                                    <ExpTip label="Jawaban Diterima" value="+30" />
                                    <ExpTip label="Upload Artikel" value="+20" />
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
            <span className="text-gray-600">{label}</span>
            <span className="font-bold" style={{ color: "var(--color-primary)" }}>{value}</span>
        </div>
    );
}
