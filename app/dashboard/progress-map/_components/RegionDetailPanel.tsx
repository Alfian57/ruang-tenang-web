"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { MapRegion, MapLandmark } from "@/types/progress-map";
import {
    X,
    Lock,
    Gift,
    Check,
    Coins,
    Zap,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegionDetailPanelProps {
    region: MapRegion;
    onClose: () => void;
    onClaimReward: (landmarkId: string) => void;
    claimingLandmark: string | null;
}

function getUnlockLabel(type: string, value: number): string {
    switch (type) {
        case "level":
            return `Level ${value}`;
        case "streak":
            return `${value} hari streak`;
        case "activity_count":
            return `${value} aktivitas`;
        case "badge":
            return `${value} badge`;
        case "xp":
            return `${value} XP`;
        default:
            return `${value}`;
    }
}

function LandmarkItem({
    landmark,
    onClaimReward,
    claimingLandmark,
    regionUnlocked,
}: {
    landmark: MapLandmark;
    onClaimReward: (id: string) => void;
    claimingLandmark: string | null;
    regionUnlocked: boolean;
}) {
    const canClaim =
        landmark.is_unlocked &&
        !landmark.reward_claimed &&
        (landmark.xp_reward > 0 || landmark.coin_reward > 0);
    const isClaiming = claimingLandmark === landmark.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 transition-colors ${landmark.is_unlocked
                    ? "bg-white border-gray-200"
                    : "bg-gray-50 border-gray-100"
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${landmark.is_unlocked
                            ? "bg-primary/10"
                            : "bg-gray-100"
                        }`}
                >
                    {landmark.is_unlocked ? (
                        landmark.icon || "📍"
                    ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4
                            className={`font-medium text-sm ${landmark.is_unlocked ? "text-gray-900" : "text-gray-400"
                                }`}
                        >
                            {landmark.name}
                        </h4>
                        {landmark.is_unlocked && landmark.reward_claimed && (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                    </div>
                    <p
                        className={`text-xs mt-0.5 ${landmark.is_unlocked ? "text-gray-500" : "text-gray-300"
                            }`}
                    >
                        {landmark.description}
                    </p>

                    {/* Progress bar for locked landmarks in unlocked regions */}
                    {regionUnlocked && !landmark.is_unlocked && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>{getUnlockLabel(landmark.unlock_type, landmark.unlock_value)}</span>
                                <span>{Math.round(landmark.progress_percent)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-primary to-primary/70 transition-all duration-500"
                                    style={{ width: `${Math.min(landmark.progress_percent, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Rewards */}
                    {(landmark.xp_reward > 0 || landmark.coin_reward > 0) && (
                        <div className="flex items-center gap-3 mt-2">
                            {landmark.xp_reward > 0 && (
                                <span className="flex items-center gap-1 text-xs text-violet-600">
                                    <Zap className="h-3 w-3" />
                                    {landmark.xp_reward} XP
                                </span>
                            )}
                            {landmark.coin_reward > 0 && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                    <Coins className="h-3 w-3" />
                                    {landmark.coin_reward}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Claim button */}
                {canClaim && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onClaimReward(landmark.id)}
                        disabled={isClaiming}
                        className="shrink-0 text-xs h-8"
                    >
                        {isClaiming ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <>
                                <Gift className="h-3 w-3 mr-1" />
                                Klaim
                            </>
                        )}
                    </Button>
                )}
            </div>
        </motion.div>
    );
}

export function RegionDetailPanel({
    region,
    onClose,
    onClaimReward,
    claimingLandmark,
}: RegionDetailPanelProps) {
    const sortedLandmarks = [...region.landmarks].sort(
        (a, b) => a.position_y - b.position_y
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[85vh] flex flex-col shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{region.icon || "🏝️"}</span>
                            <div>
                                <h2 className="font-bold text-lg text-gray-900">{region.name}</h2>
                                <p className="text-xs text-gray-500">
                                    {region.unlocked_landmarks}/{region.total_landmarks} landmark
                                    terbuka
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="px-4 py-3 bg-gray-50 border-b shrink-0">
                        <p className="text-sm text-gray-600">{region.description}</p>
                    </div>

                    {/* Landmarks list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {sortedLandmarks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Belum ada landmark di area ini
                            </div>
                        ) : (
                            sortedLandmarks.map((landmark) => (
                                <LandmarkItem
                                    key={landmark.id}
                                    landmark={landmark}
                                    onClaimReward={onClaimReward}
                                    claimingLandmark={claimingLandmark}
                                    regionUnlocked={region.is_unlocked}
                                />
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
