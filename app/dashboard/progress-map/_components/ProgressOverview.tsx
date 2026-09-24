"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Flag, Gift, Map } from "lucide-react";
import type { FullMapResponse } from "@/types/progress-map";

interface ProgressOverviewProps {
    mapData: FullMapResponse;
}

export function ProgressOverview({ mapData }: ProgressOverviewProps) {
    const prefersReducedMotion = useReducedMotion();
    const progress = Math.max(0, Math.min(100, mapData.overall_progress));
    const stats = [
        {
            icon: Map,
            label: "Area terbuka",
            value: `${mapData.unlocked_regions}/${mapData.total_regions}`,
            tone: "bg-emerald-50 text-emerald-700",
        },
        {
            icon: Flag,
            label: "Landmark",
            value: `${mapData.unlocked_landmarks}/${mapData.total_landmarks}`,
            tone: "bg-sky-50 text-sky-700",
        },
        {
            icon: Compass,
            label: "Peta selesai",
            value: `${Math.round(progress)}%`,
            tone: "bg-violet-50 text-violet-700",
        },
    ];

    return (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,0.8fr))_minmax(19rem,1.7fr)]">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.08 }}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stat.tone}`}>
                        <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-xl font-black tracking-tight text-slate-950">{stat.value}</p>
                        <p className="truncate text-xs font-medium text-slate-500">{stat.label}</p>
                    </div>
                </motion.div>
            ))}

            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.24 }}
                className="theme-accent-border-soft relative overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,white,var(--theme-accent-soft,#FFF7ED))] p-4 shadow-sm sm:col-span-2 lg:col-span-1"
            >
                <Compass className="pointer-events-none absolute -right-2 -top-3 h-20 w-20 text-theme-accent/10" strokeWidth={1.2} />
                <div className="relative flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black text-slate-900">Progres keseluruhan</p>
                                <p className="mt-0.5 text-xs text-slate-500">Hadiah menunggu di checkpoint yang selesai.</p>
                            </div>
                            <span className="text-lg font-black text-theme-accent-dark">{Math.round(progress)}%</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white shadow-inner">
                            <motion.div
                                className="h-full rounded-full bg-theme-accent transition-[width]"
                                initial={prefersReducedMotion ? false : { width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
