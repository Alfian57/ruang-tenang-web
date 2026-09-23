"use client";

import { useState } from "react";
import { cn } from "@/utils";
import { Badge, BadgeProgress, UserBadges } from "@/types";
import { Award, CheckCircle, ChevronDown, Flame, Heart, Lock, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GamificationIcon } from "./GamificationIcon";

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
                    badge.is_earned
                        ? "bg-yellow-50 border-yellow-300"
                        : "bg-gray-100 border-gray-300 opacity-50 grayscale"
                )}
            >
                <GamificationIcon name={badge.badge_key || badge.category} fallback={Award} className="h-7 w-7" />
            </div>
            <p className="mt-2 text-sm font-medium line-clamp-1">{badge.badge_name}</p>
            <p className="text-xs capitalize text-muted-foreground">{badge.category}</p>
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
                <GamificationIcon name={progress.badge_key || progress.category} fallback={Award} className="h-6 w-6" />
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
    const [showAll, setShowAll] = useState(false);
    const allBadges = Array.isArray(badges.all_badges) ? badges.all_badges : [];
    const sortedBadges = [...allBadges].sort((a, b) => Number(b.is_earned) - Number(a.is_earned));
    const visibleBadges = showAll ? sortedBadges : sortedBadges.slice(0, 8);
    const badgesByCategory = badges.badges_by_category || {};
    const categoryNames = Object.keys(badgesByCategory);
    const earnedCount = Number(badges.earned_badges ?? 0);
    const totalCount = Number(badges.total_badges ?? 0);
    const collectionProgress = totalCount > 0 ? Math.min(100, (earnedCount / totalCount) * 100) : 0;

    return (
        <div className={cn("relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm sm:p-6", className)}>
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-amber-200/25 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-lg"
                        style={{ background: `conic-gradient(#f59e0b ${collectionProgress}%, #e2e8f0 0)` }}
                    >
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-amber-500">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <Star className="absolute -right-1 -top-1 h-4 w-4 text-amber-400" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-600">Koleksi badge</p>
                        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                            {earnedCount} dari {totalCount} diraih
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-500">Teruskan kebiasaan baik untuk membuka pencapaian berikutnya.</p>
                    </div>
                </div>
                <div className="min-w-40 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-amber-800">
                        <span>Progres koleksi</span>
                        <span>{Math.round(collectionProgress)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-[width] duration-700" style={{ width: `${collectionProgress}%` }} />
                    </div>
                </div>
            </div>

            {categoryNames.length > 0 && (
                <div className="relative mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                    {categoryNames.map((category) => {
                        const catBadges = badgesByCategory[category] || [];
                        const earned = catBadges.filter(b => b.is_earned).length;
                        return (
                            <CategoryStatCard
                                key={category}
                                category={category}
                                earned={earned}
                                total={catBadges.length}
                            />
                        );
                    })}
                </div>
            )}

            {visibleBadges.length > 0 ? (
                <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {visibleBadges.map((badge) => (
                        <div
                            key={badge.id}
                            className={cn(
                                "rounded-2xl border p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                                badge.is_earned ? "border-amber-100 bg-amber-50/45" : "border-slate-200 bg-slate-50/70"
                            )}
                        >
                            <BadgeCard badge={badge} size="sm" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <Trophy className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-1">Belum Ada Badge</h3>
                        <p className="text-sm text-gray-400 max-w-sm">
                        Mulai aktivitas pertamamu untuk membuka pencapaian perjalanan.
                    </p>
                </div>
            )}

            {sortedBadges.length > 8 ? (
                <div className="relative mt-5 flex justify-center border-t border-slate-100 pt-4">
                    <Button type="button" variant="ghost" className="gap-2 rounded-xl text-slate-600" onClick={() => setShowAll((current) => !current)}>
                        {showAll ? "Tampilkan lebih sedikit" : `Lihat semua ${sortedBadges.length} badge`}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showAll && "rotate-180")} />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

interface CategoryStatCardProps {
    category: string;
    earned: number;
    total: number;
}

function CategoryStatCard({ category, earned, total }: CategoryStatCardProps) {
    const categoryIcons = {
        streak: Flame,
        activity: Zap,
        contribution: Heart,
        special: Sparkles,
        level: Award,
    };
    const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Trophy;

    const progress = total > 0 ? (earned / total) * 100 : 0;

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center gap-2 mb-2">
                <CategoryIcon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium capitalize">{category}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {earned}/{total}
            </p>
        </div>
    );
}
