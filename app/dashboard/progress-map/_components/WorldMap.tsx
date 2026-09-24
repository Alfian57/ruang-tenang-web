"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronRight, Compass, Lock, MapPin } from "lucide-react";
import type { FullMapResponse, MapRegion } from "@/types/progress-map";
import { cn } from "@/utils";
import { getJourneyTierImage } from "./journey-tier-assets";

const REGION_THEMES = [
    { gradient: "from-emerald-300 to-teal-500", ring: "ring-emerald-300/55" },
    { gradient: "from-sky-300 to-blue-500", ring: "ring-sky-300/55" },
    { gradient: "from-violet-300 to-indigo-500", ring: "ring-violet-300/55" },
    { gradient: "from-amber-300 to-orange-400", ring: "ring-amber-300/55" },
    { gradient: "from-rose-300 to-pink-500", ring: "ring-rose-300/55" },
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

type RegionState = ReturnType<typeof getRegionState>;

function CheckpointNumberArt({ number, state }: { number: string; state: RegionState }) {
    return (
        <span
            className={cn(
                "absolute inset-[3px] overflow-hidden rounded-[1.1rem] bg-linear-to-br",
                state === "completed"
                    ? "from-emerald-300 via-emerald-400 to-teal-600 text-white"
                    : state === "current"
                        ? "from-theme-accent-light via-theme-accent to-theme-accent-dark text-white"
                        : state === "locked"
                            ? "from-slate-100 via-slate-200 to-slate-300 text-slate-500"
                            : "from-theme-accent-soft via-white to-theme-accent-light text-theme-accent-dark"
            )}
            aria-hidden="true"
        >
            <span className="absolute -right-3 -top-4 h-12 w-12 rounded-full border border-current opacity-20" />
            <span className="absolute -bottom-5 -left-3 h-12 w-12 rounded-full border border-current opacity-15" />
            <svg viewBox="0 0 76 76" className="absolute inset-0 h-full w-full drop-shadow-sm">
                <path d="M9 27c8-13 20-20 34-20M43 69c10-2 18-8 24-17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
                <path d="m16 11 1.4 3.7 3.7 1.3-3.7 1.4-1.4 3.6-1.3-3.6L11 16l3.7-1.3L16 11Z" fill="currentColor" opacity=".68" />
                <circle cx="61" cy="16" r="1.8" fill="currentColor" opacity=".55" />
                <circle cx="58" cy="60" r="1.2" fill="currentColor" opacity=".45" />
                <text x="39" y="48" textAnchor="middle" fill="currentColor" opacity=".22" fontSize="29" fontWeight="900" letterSpacing="-2">{number}</text>
                <text x="37" y="46" textAnchor="middle" fill="currentColor" fontSize="29" fontWeight="900" letterSpacing="-2">{number}</text>
            </svg>
        </span>
    );
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
        <section className="journey-map-surface relative overflow-hidden rounded-[2rem] border border-slate-200/80 px-3 py-5 shadow-[0_22px_64px_-52px_rgba(15,23,42,0.35)] sm:px-6 sm:py-7">
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#cbd5e1_0.75px,transparent_0.75px)] [background-size:20px_20px]" />

            <div className="relative mx-auto max-w-5xl">
                <div className="relative mb-6 border-b border-slate-200/70 pb-5 sm:mb-8 sm:pb-7">
                    <div className="grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_210px] md:gap-5">
                        <div className="min-w-0">
                            <p className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark sm:text-[11px]">
                                <Compass className="h-3.5 w-3.5" /> Jalur perjalananmu
                            </p>
                            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Pilih checkpoint untuk menjelajah</h2>
                            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                                Setiap area menyimpan landmark dan hadiah. Intip target berikutnya, lalu lanjutkan perjalanan dengan ritmemu.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-semibold sm:gap-2 sm:text-[11px]">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1.5 text-emerald-700">
                                    <Check className="h-3 w-3" /> Selesai
                                </span>
                                <span className="theme-accent-border-soft inline-flex items-center gap-1.5 rounded-full border bg-theme-accent-soft px-2.5 py-1.5 text-theme-accent-dark">
                                    <MapPin className="h-3 w-3" /> Aktif
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/75 px-2.5 py-1.5 text-slate-500">
                                    <Lock className="h-3 w-3" /> Terkunci
                                </span>
                            </div>
                        </div>

                        <div className="relative mx-auto h-36 w-32 md:h-48 md:w-44" aria-hidden="true">
                            <div className="absolute inset-x-0 bottom-0 mx-auto aspect-square w-[92%] rounded-full bg-theme-accent-soft/80" />
                            <div className="absolute right-1 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/85 text-theme-accent shadow-sm">
                                <Compass className="h-3.5 w-3.5" />
                            </div>
                            <Image
                                src="/images/landing/mascot/checkpoint-explore.webp"
                                alt=""
                                fill
                                sizes="(max-width: 768px) 128px, 176px"
                                className="object-contain [transform:scaleX(-1)] drop-shadow-[0_10px_14px_rgba(15,23,42,0.12)]"
                            />
                        </div>
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
                                        aria-label={`Buka checkpoint ${index + 1}: ${region.name}, ${state === "completed" ? "selesai" : state === "current" ? "sedang aktif" : state === "locked" ? "terkunci" : "tersedia"}`}
                                        className={cn(
                                            "group/node relative z-10 grid h-[4.2rem] w-[4.2rem] shrink-0 place-items-center rounded-[1.45rem] border-[3px] bg-white p-[3px] shadow-[0_14px_28px_-14px_rgba(15,23,42,0.4)] outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/25 sm:h-[4.75rem] sm:w-[4.75rem]",
                                            state === "locked"
                                                ? "border-slate-200 hover:-translate-y-0.5 hover:scale-105"
                                                : state === "completed"
                                                    ? "border-emerald-200 hover:-translate-y-1 hover:scale-105"
                                                    : state === "current"
                                                        ? "theme-accent-border hover:-translate-y-1 hover:scale-105"
                                                        : "theme-accent-border-soft hover:-translate-y-1 hover:scale-105",
                                            state === "current" && `ring-4 ${theme.ring}`,
                                            isSelected && "scale-105 ring-4 ring-slate-900/10"
                                        )}
                                    >
                                        <CheckpointNumberArt number={String(index + 1).padStart(2, "0")} state={state} />
                                        <span className={cn(
                                            "absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white shadow-sm",
                                            state === "completed" ? "bg-emerald-500 text-white" : state === "current" ? "bg-white text-theme-accent-dark" : state === "locked" ? "bg-slate-300 text-white" : "bg-theme-accent-soft text-theme-accent-dark"
                                        )}>
                                            {state === "completed" ? <Check className="h-3 w-3" /> : state === "locked" ? <Lock className="h-3 w-3" /> : state === "current" ? <MapPin className="h-3 w-3" /> : <Compass className="h-3 w-3" />}
                                        </span>
                                        {state === "current" && !prefersReducedMotion ? (
                                            <motion.span
                                                className="pointer-events-none absolute inset-0 -z-10 rounded-[1.3rem] bg-primary/25"
                                                animate={{ scale: [1, 1.22], opacity: [0.55, 0] }}
                                                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                            />
                                        ) : null}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onSelectRegion(region)}
                                        className={cn(
                                            "group/card min-w-0 flex-1 rounded-[1.5rem] border p-3 text-left shadow-[0_16px_36px_-28px_rgba(15,23,42,0.5)] outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-primary/20 sm:p-4",
                                            state === "locked"
                                                ? "border-slate-200/90 bg-slate-50/95 hover:bg-white"
                                                : state === "current"
                                                    ? "border-theme-accent-border bg-white hover:-translate-y-0.5 hover:shadow-lg"
                                                    : state === "completed"
                                                        ? "border-emerald-200/80 bg-emerald-50/35 hover:-translate-y-0.5 hover:shadow-lg"
                                                        : "border-white/90 bg-white/95 hover:-translate-y-0.5 hover:shadow-lg",
                                            isSelected && "border-primary/30 ring-2 ring-primary/10"
                                        )}
                                    >
                                        <div className="grid grid-cols-[minmax(0,1fr)_5.25rem] items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_7rem] sm:gap-3.5">
                                            <div className="min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Checkpoint {String(index + 1).padStart(2, "0")}</p>
                                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-primary" />
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <h3 className={cn("line-clamp-1 text-sm font-black sm:text-base", state === "locked" ? "text-slate-500" : "text-slate-950")}>
                                                        {region.name}
                                                    </h3>
                                                    {state === "current" || state === "completed" || state === "locked" ? (
                                                        <span className={cn(
                                                            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide",
                                                            state === "current" ? "bg-theme-accent-soft text-theme-accent-dark" : state === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200/80 text-slate-500"
                                                        )}>
                                                            {state === "current" ? <MapPin className="h-2.5 w-2.5" /> : state === "completed" ? <Check className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                                                            {state === "current" ? "Aktif" : state === "completed" ? "Selesai" : "Terkunci"}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className={cn("mt-1 line-clamp-2 text-[11px] leading-relaxed sm:text-xs", state === "locked" ? "text-slate-400" : "text-slate-500")}>
                                                    {state === "locked" ? `Capai Level ${region.unlock_value} untuk membuka area ini.` : region.description}
                                                </p>

                                                <div className="mt-2.5 rounded-xl bg-slate-50/90 p-2 sm:mt-3 sm:p-2.5">
                                                    <div className="mb-1 flex items-center justify-between gap-2 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
                                                        <span>{state === "locked" ? "Syarat membuka" : "Landmark terbuka"}</span>
                                                        <span className="shrink-0 font-bold text-slate-700">{state === "locked" ? `Level ${region.unlock_value}` : `${region.unlocked_landmarks}/${region.total_landmarks}`}</span>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/75 sm:h-2">
                                                        <div
                                                            className={cn("h-full rounded-full transition-[width] duration-700", state === "locked" ? "bg-slate-300" : state === "completed" ? "bg-emerald-500" : `bg-linear-to-r ${theme.gradient}`)}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-theme-accent-soft shadow-inner ring-1 ring-black/5">
                                                <Image
                                                    src={regionImage}
                                                    alt=""
                                                    fill
                                                    sizes="(max-width: 640px) 84px, 112px"
                                                    className={cn("object-cover transition-transform duration-500 group-hover/card:scale-105", state === "locked" && "grayscale opacity-60")}
                                                    aria-hidden="true"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/25 via-transparent to-white/5" aria-hidden="true" />
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
