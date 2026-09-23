"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronRight, Lock, MapPin } from "lucide-react";
import type { FullMapResponse, MapRegion } from "@/types/progress-map";
import { cn } from "@/utils";
import { getJourneyTierImage } from "./journey-tier-assets";

const REGION_THEMES = [
    { gradient: "from-emerald-400 to-teal-600", surface: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-300/60" },
    { gradient: "from-sky-400 to-blue-600", surface: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-300/60" },
    { gradient: "from-violet-400 to-indigo-600", surface: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-300/60" },
    { gradient: "from-amber-400 to-orange-500", surface: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-300/60" },
    { gradient: "from-rose-400 to-pink-600", surface: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-300/60" },
];

interface WorldMapProps {
    mapData: FullMapResponse;
    selectedRegionKey?: string;
    onSelectRegion: (region: MapRegion) => void;
}

function getRegionState(region: MapRegion, isCurrent: boolean) {
    const isCompleted = region.is_unlocked && region.total_landmarks > 0 && region.unlocked_landmarks >= region.total_landmarks;
    if (isCompleted) return "completed";
    if (isCurrent) return "current";
    if (region.is_unlocked) return "unlocked";
    return "locked";
}

export function WorldMap({ mapData, selectedRegionKey, onSelectRegion }: WorldMapProps) {
    const prefersReducedMotion = useReducedMotion();
    const sortedRegions = [...mapData.regions].sort((a, b) => a.display_order - b.display_order);
    const activeRegionIndex = (() => {
        const firstIncomplete = sortedRegions.findIndex(
            (region) => region.is_unlocked && (region.total_landmarks === 0 || region.unlocked_landmarks < region.total_landmarks)
        );
        if (firstIncomplete >= 0) return firstIncomplete;
        for (let index = sortedRegions.length - 1; index >= 0; index -= 1) {
            if (sortedRegions[index]?.is_unlocked) return index;
        }
        return 0;
    })();

    return (
        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/78 px-3 py-6 shadow-[0_26px_80px_-52px_rgba(15,23,42,0.65)] backdrop-blur sm:px-6 sm:py-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(16,185,129,0.10),transparent_25%),radial-gradient(circle_at_86%_42%,rgba(99,102,241,0.10),transparent_28%),radial-gradient(circle_at_20%_84%,rgba(245,158,11,0.12),transparent_24%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#cbd5e1_0.75px,transparent_0.75px)] [background-size:18px_18px]" />

            <div className="relative mx-auto max-w-5xl">
                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Pilih checkpoint untuk menjelajah</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                            Setiap area menyimpan landmark dan hadiah. Area terkunci tetap dapat dibuka untuk melihat target berikutnya.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            <Check className="h-3 w-3" /> Selesai
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-primary">
                            <MapPin className="h-3 w-3" /> Aktif
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-500">
                            <Lock className="h-3 w-3" /> Terkunci
                        </span>
                    </div>
                </div>

                <div className="relative py-3">
                    <motion.div
                        className="pointer-events-none absolute bottom-12 left-[2.35rem] top-12 hidden w-[calc(100%-4.7rem)] md:block"
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        aria-hidden="true"
                    >
                        <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path
                                d="M50 0 C16 13 17 27 50 34 C84 42 83 57 50 65 C16 73 18 88 50 100"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="1.25"
                                strokeDasharray="2.5 2.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            <path
                                d="M50 0 C16 13 17 27 50 34 C84 42 83 57 50 65 C16 73 18 88 50 100"
                                fill="none"
                                stroke="url(#journeyPathGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                pathLength="100"
                                strokeDasharray="100"
                                strokeDashoffset={100 - Math.max(0, Math.min(100, mapData.overall_progress))}
                                className={prefersReducedMotion ? undefined : "transition-[stroke-dashoffset] duration-1000 ease-out"}
                                vectorEffect="non-scaling-stroke"
                            />
                            <defs>
                                <linearGradient id="journeyPathGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="55%" stopColor="var(--color-primary)" />
                                    <stop offset="100%" stopColor="#f59e0b" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>
                    <div className="pointer-events-none absolute bottom-10 left-10 top-10 w-1 rounded-full bg-slate-200 md:hidden" aria-hidden="true">
                        <motion.div
                            className="w-full origin-top rounded-full bg-linear-to-b from-emerald-400 via-primary to-amber-400"
                            initial={prefersReducedMotion ? false : { height: 0 }}
                            animate={{ height: `${Math.max(3, Math.min(100, mapData.overall_progress))}%` }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.9 }}
                        />
                    </div>

                    <div className="relative space-y-5 md:space-y-8">
                        {sortedRegions.map((region, index) => {
                            const theme = REGION_THEMES[index % REGION_THEMES.length];
                            const regionImage = getJourneyTierImage(region.region_key, index);
                            const isCurrent = index === activeRegionIndex;
                            const state = getRegionState(region, isCurrent);
                            const isSelected = selectedRegionKey === region.region_key;
                            const progress = region.total_landmarks > 0
                                ? Math.min(100, (region.unlocked_landmarks / region.total_landmarks) * 100)
                                : region.is_unlocked ? 100 : 0;
                            const isRightSide = index % 2 === 0;

                            return (
                                <motion.div
                                    key={region.id}
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: prefersReducedMotion ? 0 : Math.min(index * 0.08, 0.4), duration: 0.4 }}
                                    className={cn(
                                        "relative flex items-center gap-3 pl-1 md:w-[calc(50%+3.25rem)] md:gap-5",
                                        isRightSide ? "md:ml-auto md:flex-row" : "md:mr-auto md:flex-row-reverse"
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onSelectRegion(region)}
                                        aria-label={`Buka area ${region.name}`}
                                        className={cn(
                                            "group/node relative z-10 grid h-[4.6rem] w-[4.6rem] shrink-0 place-items-center overflow-hidden rounded-[1.45rem] border-4 border-white text-white shadow-lg outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/25 sm:h-20 sm:w-20",
                                            state === "locked"
                                                ? "bg-slate-300 text-slate-500 grayscale hover:bg-slate-400"
                                                : `bg-linear-to-br ${theme.gradient} hover:-translate-y-1 hover:scale-105`,
                                            state === "current" && `ring-4 ${theme.ring}`,
                                            isSelected && "scale-105 ring-4 ring-slate-900/10"
                                        )}
                                    >
                                        <Image
                                            src={regionImage}
                                            alt=""
                                            fill
                                            sizes="80px"
                                            className={cn(
                                                "rounded-[1.2rem] object-cover",
                                                state === "locked" ? "opacity-20 grayscale" : "opacity-90"
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span className="absolute inset-0 rounded-[1.2rem] bg-linear-to-t from-slate-950/25 to-transparent" aria-hidden="true" />
                                        {state === "locked" ? (
                                            <span className="relative flex flex-col items-center">
                                                <Lock className="h-6 w-6" />
                                                <span className="mt-0.5 text-[9px] font-black uppercase">Lv.{region.unlock_value}</span>
                                            </span>
                                        ) : null}
                                        {state === "completed" ? (
                                            <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-emerald-500 shadow">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                        ) : null}
                                        {state === "current" && !prefersReducedMotion ? (
                                            <motion.span
                                                className="absolute inset-0 -z-10 rounded-[1.45rem] bg-primary/25"
                                                animate={{ scale: [1, 1.22], opacity: [0.55, 0] }}
                                                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                            />
                                        ) : null}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onSelectRegion(region)}
                                        className={cn(
                                            "group/card min-w-0 flex-1 rounded-2xl border p-3 text-left shadow-sm outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/20 sm:p-4",
                                            state === "locked"
                                                ? "border-slate-200 bg-slate-50/90 hover:bg-white"
                                                : "border-white/90 bg-white/92 hover:-translate-y-0.5 hover:shadow-lg",
                                            isSelected && "border-primary/30 ring-2 ring-primary/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className={cn("truncate text-sm font-black sm:text-base", state === "locked" ? "text-slate-500" : "text-slate-950")}>
                                                        {region.name}
                                                    </h3>
                                                    {state === "current" ? (
                                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary">Saat ini</span>
                                                    ) : null}
                                                    {state === "completed" ? (
                                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700">Selesai</span>
                                                    ) : null}
                                                </div>
                                                <p className={cn("mt-1 line-clamp-2 text-xs leading-relaxed sm:text-sm", state === "locked" ? "text-slate-400" : "text-slate-500")}>
                                                    {state === "locked" ? `Capai Level ${region.unlock_value} untuk membuka area ini.` : region.description}
                                                </p>
                                            </div>
                                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-primary" />
                                        </div>

                                        <div className="mt-3">
                                            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                                                <span>{state === "locked" ? "Syarat area" : "Landmark terbuka"}</span>
                                                <span>{state === "locked" ? `Level ${region.unlock_value}` : `${region.unlocked_landmarks}/${region.total_landmarks}`}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={cn("h-full rounded-full transition-[width] duration-700", state === "locked" ? "bg-slate-300" : `bg-linear-to-r ${theme.gradient}`)}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </button>

                                    {state === "completed" && !prefersReducedMotion ? (
                                        <motion.span
                                            className="pointer-events-none absolute -top-2 text-amber-400"
                                            animate={{ opacity: [0, 1, 0], y: [4, -6, -11], rotate: [0, 12, -8] }}
                                            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5, delay: index * 0.2 }}
                                            style={isRightSide ? { left: "4rem" } : { right: "4rem" }}
                                            aria-hidden="true"
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.span>
                                    ) : null}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
