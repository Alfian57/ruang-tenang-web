"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressMap } from "./_hooks/useProgressMap";
import {
    ProgressOverview,
    TierJourneySection,
} from "./_components";

function MapSkeleton() {
    return (
        <div className="space-y-5">
            <div className="rounded-3xl border bg-white/80 p-5">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-52 rounded-full" />
                        <Skeleton className="h-4 w-80 rounded-full" />
                    </div>
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-16 rounded-xl" />
            <div className="space-y-6 max-w-4xl mx-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                        <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shrink-0" />
                        <Skeleton className="flex-1 h-24 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProgressMapPage() {
    const prefersReducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll();
    const smoothScrollY = useSpring(scrollYProgress, {
        stiffness: 130,
        damping: 28,
        mass: 0.25,
    });

    const {
        mapData,
        loading,
    } = useProgressMap();

    return (
        <div
            className="relative min-h-screen overflow-hidden theme-bg p-4 lg:p-6 space-y-6"
            style={{
                background: "linear-gradient(135deg, var(--theme-bg, #f8fafc) 0%, color-mix(in srgb, var(--theme-accent-soft) 42%, white) 55%, color-mix(in srgb, var(--theme-accent-light) 36%, white) 100%)",
            }}
        >
            <div className="pointer-events-none fixed right-2.5 top-1/2 z-40 hidden h-44 w-1.5 -translate-y-1/2 overflow-hidden rounded-full border border-white/80 bg-white/55 backdrop-blur-sm lg:block">
                <motion.div
                    className="h-full w-full origin-top"
                    style={{
                        scaleY: smoothScrollY,
                        background: "linear-gradient(to bottom, var(--theme-fab-from), var(--color-primary), var(--theme-accent))",
                    }}
                />
            </div>

            <div
                className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full blur-3xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 28%, transparent)" }}
            />
            <div
                className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 25%, transparent)" }}
            />

            <div className="relative w-full space-y-6">
                {/* Header */}
                <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                >
                    <div className="rounded-3xl border border-white/70 bg-white/75 backdrop-blur-md p-5 md:p-7 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div
                                className="h-12 w-12 shrink-0 rounded-2xl text-white grid place-items-center shadow-lg"
                                style={{
                                    background: "linear-gradient(135deg, var(--theme-fab-from), var(--theme-fab-to))",
                                    boxShadow: "0 10px 24px -10px color-mix(in srgb, var(--color-primary) 55%, transparent)",
                                }}
                            >
                                <MapIcon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div
                                    className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-2"
                                    style={{
                                        borderColor: "var(--theme-accent-border)",
                                        backgroundColor: "var(--theme-accent-light)",
                                        color: "var(--theme-accent-dark)",
                                    }}
                                >
                                    Dynamic Tier Journey
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                                    Peta Perjalanan
                                </h1>
                                <p className="text-slate-600 text-sm md:text-base mt-1.5 max-w-2xl">
                                    Navigasi progres kamu kini berbasis tier dinamis. Ikuti jalur, selesaikan kriteria, dan klaim hadiah saat target tercapai.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <MapSkeleton />
                ) : mapData ? (
                    <>
                        <ProgressOverview mapData={mapData} />
                        <TierJourneySection />
                    </>
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <MapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Gagal memuat peta. Silakan coba lagi.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
