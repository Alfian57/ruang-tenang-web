"use client";

import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { WeeklyProgress, PersonalJourney } from "@/types";
import { TrendingUp, TrendingDown, Minus, Zap, Activity, Award } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function XPProgressWidget() {
    const { token } = useAuthStore();
    const [journey, setJourney] = useState<PersonalJourney | null>(null);
    const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const [journeyRes, weeklyRes] = await Promise.all([
                    communityService.getPersonalJourney(token).catch(() => null),
                    communityService.getWeeklyProgress(token).catch(() => null),
                ]);
                if (journeyRes?.data) setJourney(journeyRes.data);
                if (weeklyRes?.data) setWeeklyProgress(weeklyRes.data);
            } catch {
                // Silent fail
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-100 animate-pulse">
                <div className="h-4 w-24 bg-violet-200 rounded mb-4" />
                <div className="h-8 w-32 bg-violet-200 rounded mb-3" />
                <div className="h-2 w-full bg-violet-100 rounded-full mb-4" />
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-violet-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!journey) return null;

    const progressPercent = Math.min(100, journey.exp_progress || 0);
    const weeklyExp = weeklyProgress?.exp_earned || 0;
    const monthlyExp = journey.monthly_exp || 0;

    // Determine trend
    const weeklyTrend = weeklyExp > 0 ? "up" : weeklyExp === 0 ? "neutral" : "down";
    const TrendIcon = weeklyTrend === "up" ? TrendingUp : weeklyTrend === "down" ? TrendingDown : Minus;
    const trendColor = weeklyTrend === "up" ? "text-green-500" : weeklyTrend === "down" ? "text-red-500" : "text-gray-400";

    return (
        <Link href={ROUTES.COMMUNITY} className="block">
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-100 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-violet-100 rounded-lg">
                            <Zap className="h-4 w-4 text-violet-600" />
                        </div>
                        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                            Perjalananmu
                        </span>
                    </div>
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: journey.tier_color ? `${journey.tier_color}20` : "#f3f4f6",
                            color: journey.tier_color || "#6b7280",
                        }}
                    >
                        {journey.tier_name || `Level ${journey.current_level}`}
                    </span>
                </div>

                {/* Level Progress */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1.5">
                        <span className="text-2xl font-bold text-gray-900">
                            Level {journey.current_level}
                        </span>
                        <span className="text-sm text-gray-500">
                            {journey.current_exp?.toLocaleString()} XP
                        </span>
                    </div>
                    <div className="w-full h-2.5 bg-violet-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {journey.exp_to_next_level?.toLocaleString()} XP lagi ke Level {journey.current_level + 1}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/70 rounded-lg p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{weeklyExp}</p>
                        <p className="text-[10px] text-gray-500">XP Minggu Ini</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{monthlyExp}</p>
                        <p className="text-[10px] text-gray-500">XP Bulan Ini</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{journey.badges_earned}</p>
                        <p className="text-[10px] text-gray-500">Badge</p>
                    </div>
                </div>

                {/* Activity Breakdown (if available) */}
                {weeklyProgress?.breakdown && weeklyProgress.breakdown.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-violet-100">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Aktivitas Minggu Ini</p>
                        <div className="flex flex-wrap gap-1.5">
                            {weeklyProgress.breakdown.slice(0, 4).map((item) => (
                                <span
                                    key={item.activity_type}
                                    className="text-[10px] bg-white/80 text-gray-600 px-2 py-0.5 rounded-full border border-violet-100"
                                >
                                    {item.label}: {item.count}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
