"use client";

import { cn } from "@/lib/utils";
import { Badge, BadgeProgress, UserBadges, BadgeCategoryStats } from "@/types";
import { Trophy, Lock, CheckCircle } from "lucide-react";

interface BadgeCardProps {
    badge: Badge;
    size?: "sm" | "md" | "lg";
    showDescription?: boolean;
    className?: string;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600" },
    uncommon: { bg: "bg-green-100", border: "border-green-300", text: "text-green-600" },
    rare: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-600" },
    epic: { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-600" },
    legendary: { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-700" },
};

export function BadgeCard({ badge, size = "md", showDescription = false, className }: BadgeCardProps) {
    const rarity = rarityColors[badge.rarity] || rarityColors.common;

    const sizeClasses = {
        sm: "w-12 h-12 text-xl",
        md: "w-16 h-16 text-2xl",
        lg: "w-20 h-20 text-3xl",
    };

    return (
        <div className={cn("flex flex-col items-center text-center", className)}>
            <div
                className={cn(
                    "rounded-full flex items-center justify-center border-2",
                    sizeClasses[size],
                    rarity.bg,
                    rarity.border,
                    badge.earned_at ? "" : "opacity-50 grayscale"
                )}
            >
                <span>{badge.icon}</span>
            </div>
            <p className="mt-2 text-sm font-medium line-clamp-1">{badge.name}</p>
            <p className={cn("text-xs capitalize", rarity.text)}>{badge.rarity}</p>
            {showDescription && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {badge.description}
                </p>
            )}
            {badge.earned_at && (
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(badge.earned_at).toLocaleDateString("id-ID")}
                </p>
            )}
        </div>
    );
}

interface BadgeProgressCardProps {
    progress: BadgeProgress;
    className?: string;
}

export function BadgeProgressCard({ progress, className }: BadgeProgressCardProps) {
    const rarity = rarityColors[progress.rarity] || rarityColors.common;

    return (
        <div className={cn(
            "bg-card rounded-lg border p-4 flex items-start gap-4",
            className
        )}>
            <div
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 text-xl shrink-0",
                    rarity.bg,
                    rarity.border,
                    progress.earned ? "" : "opacity-60"
                )}
            >
                <span>{progress.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{progress.name}</h4>
                    {progress.earned ? (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {progress.description}
                </p>

                {!progress.earned && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{progress.current_value}/{progress.target_value}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", rarity.bg)}
                                style={{
                                    width: `${Math.min(progress.progress_percent, 100)}%`,
                                    backgroundColor: rarity.border.replace("border-", "").replace("-300", "-500").replace("-400", "-500")
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface BadgeShowcaseProps {
    badges: UserBadges;
    className?: string;
}

export function BadgeShowcase({ badges, className }: BadgeShowcaseProps) {
    return (
        <div className={cn("bg-card rounded-xl border shadow-sm p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Badge Collection</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                    {badges.total_earned}/{badges.total_available} diraih
                </span>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {badges.category_stats.map((stat) => (
                    <CategoryStatCard key={stat.category} stat={stat} />
                ))}
            </div>

            {/* Earned Badges */}
            {badges.earned_badges.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {badges.earned_badges.map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} size="sm" />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">
                    Belum ada badge yang diraih. Terus beraktivitas untuk mendapatkan badge!
                </p>
            )}
        </div>
    );
}

interface CategoryStatCardProps {
    stat: BadgeCategoryStats;
}

function CategoryStatCard({ stat }: CategoryStatCardProps) {
    const categoryIcons: Record<string, string> = {
        streak: "🔥",
        activity: "⚡",
        contribution: "💝",
        special: "🌟",
        level: "🎖️",
    };

    const progress = stat.total > 0 ? (stat.earned / stat.total) * 100 : 0;

    return (
        <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
                <span>{categoryIcons[stat.category] || "🏆"}</span>
                <span className="text-sm font-medium capitalize">{stat.category}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {stat.earned}/{stat.total}
            </p>
        </div>
    );
}
