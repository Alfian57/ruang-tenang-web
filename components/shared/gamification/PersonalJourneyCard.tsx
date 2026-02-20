"use client";

import { cn } from "@/utils";
import { PersonalJourney } from "@/types";
import { Flame, Calendar, Target, Star, TrendingUp } from "lucide-react";

interface PersonalJourneyCardProps {
    journey: PersonalJourney;
    className?: string;
}

export function PersonalJourneyCard({ journey, className }: PersonalJourneyCardProps) {
    const currentExp = Number(journey.current_exp ?? 0);
    const expProgress = Number(journey.exp_progress ?? 0);
    const expToNextLevel = Number(journey.exp_to_next_level ?? 0);
    const weeklyExp = Number(journey.weekly_exp ?? 0);
    const unlockedFeatures = Number(journey.unlocked_features ?? 0);
    const totalFeatures = Number(journey.total_features ?? 0);
    const levelProgressDenominator = expToNextLevel + expProgress;
    const progressPercent = Math.min(
        levelProgressDenominator > 0 ? (expProgress / levelProgressDenominator) * 100 : 0,
        100
    );
    const unlockedFeaturePercent = totalFeatures > 0 ? (unlockedFeatures / totalFeatures) * 100 : 0;

    return (
        <div className={cn("bg-card rounded-xl border shadow-sm p-6", className)}>
            {/* Header with tier */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: journey.tier_color }}
                >
                    {journey.current_level}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{journey.name}</h3>
                    <p
                        className="text-sm font-medium"
                        style={{ color: journey.tier_color }}
                    >
                        {journey.tier_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Peringkat #{journey.rank_in_level} dari {journey.total_in_level} di level ini
                    </p>
                </div>
            </div>

            {/* EXP Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress Level</span>
                    <span className="font-medium">{currentExp.toLocaleString()} EXP</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: journey.tier_color
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {expToNextLevel.toLocaleString()} EXP lagi ke level berikutnya
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatItem
                    icon={Flame}
                    label="Streak Saat Ini"
                    value={`${journey.current_streak} hari`}
                    color="text-orange-500"
                />
                <StatItem
                    icon={Target}
                    label="Streak Terpanjang"
                    value={`${journey.longest_streak} hari`}
                    color="text-blue-500"
                />
                <StatItem
                    icon={TrendingUp}
                    label="EXP Minggu Ini"
                    value={`+${weeklyExp.toLocaleString()}`}
                    color="text-green-500"
                />
                <StatItem
                    icon={Star}
                    label="Badge Diraih"
                    value={`${journey.badges_earned} badge`}
                    color="text-yellow-500"
                />
            </div>

            {/* Features Progress */}
            <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fitur Terbuka
                    </span>
                    <span className="font-medium">
                        {unlockedFeatures}/{totalFeatures}
                    </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                            width: `${unlockedFeaturePercent}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

interface StatItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
                <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
                <p className="text-sm font-medium">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
