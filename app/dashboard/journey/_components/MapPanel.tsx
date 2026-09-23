"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flag, MapIcon, RefreshCw, Star, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useProgressMap } from "@/app/dashboard/progress-map/_hooks/useProgressMap";
import {
    ProgressOverview,
    RegionDetailPanel,
    WorldMap,
} from "@/app/dashboard/progress-map/_components";

function MapSkeleton() {
    return (
        <div className="space-y-5" aria-label="Memuat peta perjalanan">
            <Skeleton className="h-52 w-full rounded-3xl" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-28 rounded-2xl" />
                ))}
            </div>
            <Skeleton className="h-[42rem] w-full rounded-[2rem]" />
        </div>
    );
}

export default function MapPanel() {
    const prefersReducedMotion = useReducedMotion();
    const user = useAuthStore((state) => state.user);
    const {
        mapData,
        selectedRegion,
        loading,
        hasError,
        claimingLandmark,
        handleSelectRegion,
        handleCloseRegion,
        handleClaimReward,
        retry,
    } = useProgressMap();

    const nextTarget = useMemo(() => {
        if (!mapData) return null;
        const sortedRegions = [...mapData.regions].sort((a, b) => a.display_order - b.display_order);
        for (const region of sortedRegions) {
            if (!region.is_unlocked) {
                return {
                    label: region.name,
                    detail: `Capai Level ${region.unlock_value} untuk membuka area baru`,
                };
            }
            const pendingLandmark = [...region.landmarks]
                .sort((a, b) => a.position_y - b.position_y)
                .find((landmark) => !landmark.is_unlocked);
            if (pendingLandmark) {
                return {
                    label: pendingLandmark.name,
                    detail: `${Math.round(pendingLandmark.progress_percent)}% menuju landmark berikutnya`,
                };
            }
        }
        return {
            label: "Semua checkpoint dijelajahi",
            detail: "Kamu telah menyelesaikan perjalanan yang tersedia",
        };
    }, [mapData]);

    if (loading) return <MapSkeleton />;

    if (hasError || !mapData) {
        return (
            <div className="rounded-3xl border border-dashed border-primary/25 bg-white/80 px-6 py-16 text-center shadow-sm">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <MapIcon className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">Peta belum berhasil dimuat</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Perjalananmu tetap tersimpan. Coba muat ulang peta untuk melanjutkan.</p>
                <Button type="button" variant="outline" className="mt-5 gap-2 rounded-xl" onClick={() => void retry()}>
                    <RefreshCw className="h-4 w-4" />
                    Coba lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="journey-map-hero relative isolate overflow-hidden rounded-3xl border border-white/80 p-5 text-white sm:p-7"
            >
                <div className="journey-hero-glow-primary pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl" />
                <div className="journey-hero-glow-secondary pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_0.7px,transparent_0.7px)] [background-size:19px_19px]" />

                <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Peta Perjalananmu</h2>
                        <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
                            Ikuti jalur, buka landmark, dan klaim hadiah di setiap chapter pertumbuhanmu.
                        </p>
                        {nextTarget ? (
                            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3.5 py-3 backdrop-blur">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
                                    <Flag className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">Target: {nextTarget.label}</p>
                                    <p className="truncate text-xs text-white/65">{nextTarget.detail}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { icon: Star, label: "Level", value: user?.level ?? 1 },
                            { icon: Zap, label: "Total XP", value: Number(user?.exp ?? 0).toLocaleString("id-ID") },
                            { icon: TrendingUp, label: "Progres", value: `${Math.round(mapData.overall_progress)}%` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="min-w-24 rounded-2xl border border-white/10 bg-white/8 px-3 py-3 text-center backdrop-blur sm:min-w-28">
                                <Icon className="mx-auto h-4 w-4 text-white/85" />
                                <p className="mt-1.5 truncate text-base font-black">{value}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            <ProgressOverview mapData={mapData} />

            <WorldMap
                mapData={mapData}
                selectedRegionKey={selectedRegion?.region_key}
                onSelectRegion={handleSelectRegion}
            />

            {selectedRegion ? (
                <RegionDetailPanel
                    region={selectedRegion}
                    onClose={handleCloseRegion}
                    onClaimReward={handleClaimReward}
                    claimingLandmark={claimingLandmark}
                />
            ) : null}
        </div>
    );
}
