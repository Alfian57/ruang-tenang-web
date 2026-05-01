"use client";

import { cn } from "@/utils";
import { PersonalJourney } from "@/types";
import { Flame, Target, Star, TrendingUp, Activity, Info } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

interface PersonalJourneyCardProps {
    journey: PersonalJourney;
    className?: string;
    onShowLevelGuide?: () => void;
}

export function PersonalJourneyCard({ journey, className, onShowLevelGuide }: PersonalJourneyCardProps) {
    const currentExp = Number(journey.current_exp ?? 0);
    const progressPercent = Math.min(100, Math.max(0, Number(journey.progress_percent ?? 0)));
    const expToNextLevel = Number(journey.exp_to_next_level ?? 0);
    const monthlyXp = Number(journey.monthly_xp ?? 0);

    const { user } = useAuthStore();
    const [imageError, setImageError] = useState(false);

    return (
        <div className={cn("bg-card rounded-xl border shadow-sm p-6", className)}>
            {/* Header with tier */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden shadow-sm"
                        style={{ backgroundColor: journey.tier_color || "#EF4444" }}
                    >
                        {user?.avatar ? (
                            <Image src={user.avatar} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-white">{user?.name?.charAt(0).toUpperCase() || journey.current_level}</span>
                        )}
                    </div>
                    {/* Level indicator overlay */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
                        <span className="text-xs font-bold" style={{ color: journey.tier_color || "#EF4444" }}>
                            {journey.current_level}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {!imageError && journey.badge_icon ? (
                            <div className="w-6 h-6 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                <Image 
                                    src={journey.badge_icon} 
                                    alt={journey.badge_name} 
                                    width={24} 
                                    height={24} 
                                    className="object-contain"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 text-xs font-bold">
                                {journey.badge_name?.charAt(0).toUpperCase() || <Star className="w-3 h-3" />}
                            </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                            {journey.badge_name}
                        </h3>
                    </div>
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
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
                <StatItem
                    icon={Flame}
                    label="Streak Saat Ini"
                    value={`${journey.current_streak} hari`}
                    color="theme-accent-text"
                />
                <StatItem
                    icon={Target}
                    label="Streak Terpanjang"
                    value={`${journey.longest_streak} hari`}
                    color="text-blue-500"
                />
                <StatItem
                    icon={TrendingUp}
                    label="EXP Bulan Ini"
                    value={`+${monthlyXp.toLocaleString()}`}
                    color="text-green-500"
                />
                <StatItem
                    icon={Star}
                    label="Badge Diraih"
                    value={`${journey.new_badges_count ?? 0} badge`}
                    color="text-yellow-500"
                />
            </div>

            {/* Activity Summary */}
            <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Total Aktivitas
                    </span>
                    <span className="font-medium">
                        {Number(journey.total_activities ?? 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Level Guide Button */}
            {onShowLevelGuide && (
                <button
                    onClick={onShowLevelGuide}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 text-sm font-medium hover:shadow-md hover:border-indigo-300 transition-all"
                >
                    <Info className="h-4 w-4" />
                    Lihat Panduan Level & Tier
                </button>
            )}
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
