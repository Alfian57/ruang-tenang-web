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
                "relative overflow-hidden rounded-2xl border p-3.5 transition-colors",
                isCompleted
                    ? "border-emerald-100 bg-emerald-50/60"
                    : landmark.is_unlocked
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50/80"
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-lg shadow-sm",
                        isCompleted
                            ? "border-emerald-100 bg-emerald-100 text-emerald-700"
                            : landmark.is_unlocked
                                ? "border-primary/10 bg-primary/8 text-primary"
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
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div className="h-full rounded-full bg-linear-to-r from-sky-400 to-primary transition-[width] duration-700" style={{ width: `${Math.min(100, landmark.progress_percent)}%` }} />
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
                        className="h-9 shrink-0 gap-1.5 rounded-xl bg-amber-500 px-3 text-xs text-white shadow-sm hover:bg-amber-600"
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

    return (
        <Dialog open onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <DialogContent className="!bottom-0 !left-0 !top-auto flex max-h-[88vh] w-full !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-[2rem] border border-white/70 bg-white p-0 shadow-2xl [&>button:last-child]:hidden md:!bottom-auto md:!left-auto md:!right-5 md:!top-1/2 md:!w-[min(34rem,calc(100vw-2.5rem))] md:!-translate-y-1/2 md:rounded-[2rem]">
                    <DialogTitle className="sr-only">Detail area {region.name}</DialogTitle>
                    <DialogDescription className="sr-only">Progres dan landmark untuk area {region.name}</DialogDescription>
                    <header className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#0f172a,#1e293b_58%,#312e81)] p-5 text-white">
                        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary/35 blur-3xl" />
                        <div className="relative flex items-start gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-lg">
                                <Image src={regionImage} alt="" fill sizes="48px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300">
                                    {region.is_unlocked ? "Area perjalanan" : "Area terkunci"}
                                </p>
                                <h2 className="mt-1 text-xl font-black tracking-tight">{region.name}</h2>
                                <p className="mt-1 text-xs leading-relaxed text-slate-300">{region.description}</p>
                            </div>
                            <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" aria-label="Tutup detail area">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="relative mt-4 rounded-xl border border-white/10 bg-white/8 p-3">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                                <span>{region.is_unlocked ? "Progres landmark" : "Syarat membuka area"}</span>
                                <span>{region.is_unlocked ? `${region.unlocked_landmarks}/${region.total_landmarks}` : `Level ${region.unlock_value}`}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-black/20">
                                <div className="h-full rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-amber-300 transition-[width] duration-700" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </header>

                    {!region.is_unlocked ? (
                        <div className="border-b border-amber-100 bg-amber-50 px-5 py-4">
                            <div className="flex gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-950">Checkpoint berikutnya menunggumu</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800/75">
                                        Capai Level {region.unlock_value} untuk membuka area dan seluruh landmark di dalamnya.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-900">Landmark area</p>
                                <p className="text-xs text-slate-500">Selesaikan target, lalu klaim hasil perjalananmu.</p>
                            </div>
                            <Gift className="h-5 w-5 text-amber-400" />
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
