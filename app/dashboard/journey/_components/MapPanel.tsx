"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Flag, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useProgressMap } from "@/app/dashboard/progress-map/_hooks/useProgressMap";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";
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
            <DashboardMascotEmpty image="/images/landing/mascot/map.webp" title="Peta belum berhasil dimuat" description="Perjalananmu tetap tersimpan. Coba muat ulang peta untuk melanjutkan." action={<Button type="button" variant="outline" onClick={() => void retry()}>Coba lagi</Button>} />
        );
    }

    return (
        <div className="min-w-0 space-y-5 pb-8">
            <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="journey-map-hero theme-accent-border-soft relative isolate overflow-hidden rounded-3xl border p-5 sm:p-7"
            >
                <div className="journey-hero-glow-primary pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl" />
                <div className="journey-hero-glow-secondary pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#64748b_0.7px,transparent_0.7px)] [background-size:20px_20px]" />

                <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark">Perjalanan bertumbuh</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Peta Perjalananmu</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Ikuti jalur, buka landmark, dan klaim hadiah di setiap chapter pertumbuhanmu.
                        </p>
                        {nextTarget ? (
                            <div className="mt-5 flex max-w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-3.5 py-3 shadow-sm backdrop-blur sm:inline-flex">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                                    <Flag className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-800">Target: {nextTarget.label}</p>
                                    <p className="text-xs leading-relaxed text-slate-500">{nextTarget.detail}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { icon: Award, label: "Level", value: user?.level ?? 1 },
                            { icon: Zap, label: "Total XP", value: Number(user?.exp ?? 0).toLocaleString("id-ID") },
                            { icon: TrendingUp, label: "Progres", value: `${Math.round(mapData.overall_progress)}%` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="min-w-0 rounded-2xl border border-white/90 bg-white/75 px-2 py-3 text-center text-slate-900 shadow-sm backdrop-blur sm:min-w-28 sm:px-3">
                                <Icon className="mx-auto h-4 w-4 text-theme-accent" />
                                <p className="mt-1.5 truncate text-base font-black">{value}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
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
