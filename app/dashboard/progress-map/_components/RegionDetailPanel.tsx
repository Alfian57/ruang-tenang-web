"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
    Check,
    Coins,
    Gift,
    Loader2,
    Lock,
    X,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { MapLandmark, MapRegion } from "@/types/progress-map";
import { cn } from "@/utils";
import { getJourneyTierImage } from "./journey-tier-assets";

interface RegionDetailPanelProps {
    region: MapRegion;
    onClose: () => void;
    onClaimReward: (landmarkId: string) => void;
    claimingLandmark: string | null;
}

function getUnlockLabel(type: string, value: number, activity?: string): string {
    const activityLabels: Record<string, string> = {
        login: "login",
        mood: "catatan mood",
        chat: "sesi chat",
        article: "artikel dibaca",
        write_article: "artikel ditulis",
        journal: "jurnal ditulis",
        forum: "diskusi forum",
        story: "kisah dibagikan",
    };

    switch (type) {
        case "level":
            return `Capai Level ${value}`;
        case "streak":
            return `Pertahankan streak ${value} hari`;
        case "activity_count":
            return `Selesaikan ${value} ${activityLabels[activity || ""] || "aktivitas"}`;
        case "badge":
            return `Kumpulkan ${value} badge`;
        case "xp":
            return `Kumpulkan ${value.toLocaleString("id-ID")} XP`;
        default:
            return `Capai target ${value}`;
    }
}

function LandmarkItem({
    landmark,
    onClaimReward,
    claimingLandmark,
    regionUnlocked,
    regionImage,
}: {
    landmark: MapLandmark;
    onClaimReward: (id: string) => void;
    claimingLandmark: string | null;
    regionUnlocked: boolean;
    regionImage: string;
}) {
    const canClaim =
        regionUnlocked &&
        landmark.is_unlocked &&
        !landmark.reward_claimed &&
        (landmark.xp_reward > 0 || landmark.coin_reward > 0);
    const isClaiming = claimingLandmark === landmark.id;
    const isCompleted = landmark.reward_claimed;

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-[1.35rem] border p-3.5 transition-colors",
                isCompleted
                    ? "border-emerald-100 bg-emerald-50/55"
                    : landmark.is_unlocked
                        ? "border-slate-200/80 bg-white hover:border-theme-accent-border"
                        : "border-slate-100 bg-slate-50/75"
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border text-lg shadow-sm",
                        isCompleted
                            ? "border-emerald-100 bg-emerald-100 text-emerald-700"
                            : landmark.is_unlocked
                                ? "border-theme-accent-border-soft bg-theme-accent-soft text-theme-accent-dark"
                                : "border-slate-200 bg-white text-slate-400"
                    )}
                >
                    {isCompleted ? (
                        <Check className="h-5 w-5" />
                    ) : landmark.is_unlocked ? (
                        <Image src={regionImage} alt="" width={44} height={44} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                        <Lock className="h-4 w-4" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className={cn("text-sm font-bold", landmark.is_unlocked ? "text-slate-900" : "text-slate-500")}>
                            {landmark.name}
                        </h4>
                        {isCompleted ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700">Diklaim</span>
                        ) : null}
                    </div>
                    <p className={cn("mt-0.5 text-xs leading-relaxed", landmark.is_unlocked ? "text-slate-500" : "text-slate-400")}>
                        {landmark.description}
                    </p>

                    {!landmark.is_unlocked ? (
                        <div className="mt-3">
                            <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-semibold text-slate-500">
                                <span className="truncate">{getUnlockLabel(landmark.unlock_type, landmark.unlock_value, landmark.unlock_activity)}</span>
                                <span>{Math.round(landmark.progress_percent)}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                                <div className="h-full rounded-full bg-theme-accent transition-[width] duration-700" style={{ width: `${Math.min(100, landmark.progress_percent)}%` }} />
                            </div>
                        </div>
                    ) : null}

                    {landmark.xp_reward > 0 || landmark.coin_reward > 0 ? (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            {landmark.xp_reward > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                                    <Zap className="h-3 w-3" /> +{landmark.xp_reward} XP
                                </span>
                            ) : null}
                            {landmark.coin_reward > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                                    <Coins className="h-3 w-3" /> +{landmark.coin_reward} koin
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {canClaim ? (
                    <Button
                        size="sm"
                        onClick={() => onClaimReward(landmark.id)}
                        disabled={isClaiming}
                        className="theme-accent-bg theme-accent-bg-hover h-9 shrink-0 gap-1.5 rounded-xl px-3 text-xs text-white shadow-sm"
                    >
                        {isClaiming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
                        <span className="hidden sm:inline">Klaim</span>
                    </Button>
                ) : null}
            </div>
        </motion.article>
    );
}

export function RegionDetailPanel({
    region,
    onClose,
    onClaimReward,
    claimingLandmark,
}: RegionDetailPanelProps) {
    const sortedLandmarks = [...region.landmarks].sort((a, b) => a.position_y - b.position_y);
    const regionImage = getJourneyTierImage(region.region_key);
    const progress = region.total_landmarks > 0
        ? Math.min(100, (region.unlocked_landmarks / region.total_landmarks) * 100)
        : region.is_unlocked ? 100 : 0;
    const isComplete = region.is_unlocked && region.total_landmarks > 0 && region.unlocked_landmarks >= region.total_landmarks;
    const regionStatus = !region.is_unlocked ? "Terkunci" : isComplete ? "Tuntas" : "Berjalan";

    return (
        <Dialog open onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <DialogContent className="!bottom-auto !left-1/2 !right-auto !top-1/2 flex max-h-[88dvh] w-[min(42rem,calc(100vw-2rem))] !max-w-none !-translate-x-1/2 !-translate-y-1/2 flex-col gap-0 overflow-hidden rounded-[2rem] border border-white/80 bg-white p-0 shadow-2xl [&>button:last-child]:hidden">
                <DialogTitle className="sr-only">Detail area {region.name}</DialogTitle>
                <DialogDescription className="sr-only">Progres dan landmark untuk area {region.name}</DialogDescription>
                <header className="journey-tier-detail-header relative overflow-hidden border-b border-theme-accent-border-soft p-5 text-slate-900 sm:p-6">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-theme-accent-soft/80 blur-3xl" aria-hidden="true" />
                    <div className="relative flex items-start gap-3.5">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-white shadow-md ring-1 ring-black/5 sm:h-24 sm:w-24">
                            <Image src={regionImage} alt="" fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/20 to-transparent" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-theme-accent-dark">Checkpoint {String(region.display_order).padStart(2, "0")}</p>
                                <span className={cn(
                                    "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide",
                                    isComplete ? "bg-emerald-100 text-emerald-700" : region.is_unlocked ? "bg-theme-accent-soft text-theme-accent-dark" : "bg-slate-200 text-slate-600"
                                )}>{regionStatus}</span>
                            </div>
                            <h2 className="mt-1 text-lg font-black tracking-tight sm:text-xl">{region.name}</h2>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{region.description}</p>
                        </div>
                        <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/80 bg-white/75 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900" aria-label="Tutup detail area">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="relative mt-4 rounded-2xl border border-white/90 bg-white/80 p-3.5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
                            <span className="text-slate-600">{region.is_unlocked ? "Progres landmark" : "Syarat membuka area"}</span>
                            <span className="shrink-0 font-black text-slate-900">{region.is_unlocked ? `${region.unlocked_landmarks}/${region.total_landmarks} landmark` : `Level ${region.unlock_value}`}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
                            <div className={cn("h-full rounded-full transition-[width] duration-700", isComplete ? "bg-emerald-500" : region.is_unlocked ? "bg-theme-accent" : "bg-slate-300")} style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </header>

                {!region.is_unlocked ? (
                    <div className="theme-accent-border-soft border-b bg-theme-accent-soft/75 px-5 py-4">
                        <div className="flex gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-theme-accent-dark shadow-sm">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Checkpoint berikutnya menunggumu</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                    Capai Level {region.unlock_value} untuk membuka area dan seluruh landmark di dalamnya.
                                </p>
                            </div>
                        </div>
                    </div>
                    ) : null}

                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-900">Landmark area</p>
                                <p className="text-xs text-slate-500">{sortedLandmarks.length} target untuk area ini · selesaikan lalu klaim hasilnya.</p>
                            </div>
                            <Gift className="h-5 w-5 text-theme-accent" />
                        </div>

                        {sortedLandmarks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                                Belum ada landmark di area ini.
                            </div>
                        ) : (
                            sortedLandmarks.map((landmark) => (
                                <LandmarkItem
                                    key={landmark.id}
                                    landmark={landmark}
                                    onClaimReward={onClaimReward}
                                    claimingLandmark={claimingLandmark}
                                    regionUnlocked={region.is_unlocked}
                                    regionImage={regionImage}
                                />
                            ))
                        )}
                    </div>
            </DialogContent>
        </Dialog>
    );
}
