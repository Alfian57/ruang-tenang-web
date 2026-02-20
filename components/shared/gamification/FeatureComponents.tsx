"use client";

import { cn } from "@/utils";
import { FeatureUnlock, UserFeatures, FeaturesByLevel } from "@/types";
import { Lock, Unlock, Sparkles, Gift } from "lucide-react";

interface FeatureCardProps {
    feature: FeatureUnlock;
    isLocked?: boolean;
    levelsAway?: number;
    className?: string;
}

export function FeatureCard({ feature, isLocked = false, levelsAway, className }: FeatureCardProps) {
    return (
        <div
            className={cn(
                "bg-card rounded-lg border p-4 transition-all",
                isLocked ? "opacity-60" : "hover:shadow-md",
                className
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                    isLocked ? "bg-muted" : "bg-primary/10"
                )}>
                    {feature.icon || "✨"}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{feature.name}</h4>
                        {isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                            <Unlock className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {feature.description}
                    </p>
                    {isLocked && levelsAway !== undefined && (
                        <p className="text-xs text-primary mt-1">
                            {levelsAway} level lagi untuk membuka
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface FeatureLevelGroupProps {
    levelData: FeaturesByLevel;
    isCurrentLevel?: boolean;
    className?: string;
}

export function FeatureLevelGroup({ levelData, isCurrentLevel, className }: FeatureLevelGroupProps) {
    return (
        <div className={cn("rounded-xl border overflow-hidden", className)}>
            {/* Level Header */}
            <div
                className={cn(
                    "p-4 text-white",
                    isCurrentLevel ? "bg-primary" : "bg-muted text-foreground"
                )}
                style={!isCurrentLevel && levelData.tier_color ? { backgroundColor: levelData.tier_color } : undefined}
            >
                <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    <span className="font-semibold">Level {levelData.level}</span>
                    {isCurrentLevel && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            Level Kamu
                        </span>
                    )}
                </div>
                <p className={cn("text-sm", isCurrentLevel ? "text-white/90" : "text-white/80")}>
                    {levelData.tier_name}
                </p>
            </div>

            {/* Features */}
            <div className="p-4 space-y-3">
                {levelData.features.length > 0 ? (
                    levelData.features.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                        Tidak ada fitur baru di level ini
                    </p>
                )}
            </div>
        </div>
    );
}

interface UserFeaturesOverviewProps {
    features: UserFeatures;
    className?: string;
}

export function UserFeaturesOverview({ features, className }: UserFeaturesOverviewProps) {
    const unlockedFeatures = Array.isArray(features.unlocked_features) ? features.unlocked_features : [];
    const lockedFeatures = Array.isArray(features.locked_features) ? features.locked_features : [];
    const totalUnlocked = Number(features.total_unlocked ?? unlockedFeatures.length);
    const totalFeatures = Number(features.total_features ?? unlockedFeatures.length + lockedFeatures.length);
    const progress = totalFeatures > 0 ? (totalUnlocked / totalFeatures) * 100 : 0;

    return (
        <div className={cn("bg-card rounded-xl border shadow-sm p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Fitur Terbuka</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                    Level {Number(features.current_level ?? 1)}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress Pembukaan Fitur</span>
                    <span className="font-medium">
                        {totalUnlocked}/{totalFeatures}
                    </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Unlocked Features */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-green-500" />
                    Fitur Terbuka ({unlockedFeatures.length})
                </h4>
                <div className="grid gap-3">
                    {unlockedFeatures.slice(0, 4).map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                    ))}
                </div>

                {/* Locked Features Preview */}
                {lockedFeatures.length > 0 && (
                    <>
                        <h4 className="text-sm font-medium flex items-center gap-2 mt-6">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            Segera Terbuka ({lockedFeatures.length})
                        </h4>
                        <div className="grid gap-3">
                            {lockedFeatures.slice(0, 2).map((feature) => (
                                <FeatureCard
                                    key={feature.id}
                                    feature={feature}
                                    isLocked
                                    levelsAway={feature.levels_away}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

interface FeatureUnlockCelebrationProps {
    features: FeatureUnlock[];
    levelName: string;
    onClose?: () => void;
    className?: string;
}

export function FeatureUnlockCelebration({
    features,
    levelName,
    onClose,
    className
}: FeatureUnlockCelebrationProps) {
    if (features.length === 0) return null;

    return (
        <div className={cn(
            "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
            className
        )}>
            <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in">
                {/* Celebration Icon */}
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-10 w-10 text-primary" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Selamat! 🎉</h2>
                <p className="text-muted-foreground mb-6">
                    Kamu telah mencapai {levelName} dan membuka fitur baru!
                </p>

                {/* New Features */}
                <div className="space-y-3 mb-6">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="bg-muted/50 rounded-lg p-3 flex items-center gap-3"
                        >
                            <span className="text-2xl">{feature.icon || "✨"}</span>
                            <div className="text-left">
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors"
                >
                    Lanjutkan
                </button>
            </div>
        </div>
    );
}
