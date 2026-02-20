"use client";

import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { WeeklyProgress, PersonalJourney } from "@/types";
import { TrendingUp, TrendingDown, Minus, Zap, Activity, Award } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
            <Card className="border-none shadow-sm flex flex-col">
                <CardHeader>
                    <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    if (!journey) return null;

    const currentExp = Number(journey.current_exp ?? 0);
    const currentLevel = Number(journey.current_level ?? 1);
    const expToNextLevel = Number(journey.exp_to_next_level ?? 0);
    const expProgress = Number(journey.exp_progress ?? 0);
    const weeklyExp = Number(weeklyProgress?.exp_earned ?? 0);
    const monthlyExp = Number(journey.monthly_exp ?? 0);
    const badgesEarned = Number(journey.badges_earned ?? 0);
    const progressPercent = Math.min(100, Math.max(0, expProgress));

    // Determine trend
    const weeklyTrend = weeklyExp > 0 ? "up" : weeklyExp === 0 ? "neutral" : "down";
    const TrendIcon = weeklyTrend === "up" ? TrendingUp : weeklyTrend === "down" ? TrendingDown : Minus;
    const trendColor = weeklyTrend === "up" ? "text-green-500" : weeklyTrend === "down" ? "text-red-500" : "text-gray-400";

    return (
        <Card className="flex flex-col border border-gray-100 shadow-sm bg-linear-to-br from-white to-violet-50/40">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                    <Zap className="w-5 h-5 text-violet-500" />
                    Perjalananmu
                </CardTitle>
                <Link href={ROUTES.DASHBOARD_COMMUNITY}>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-violet-600">
                        Detail <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4 pt-2">
                <div className="rounded-xl border border-violet-100 bg-white/70 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl font-bold text-gray-900">Level {currentLevel}</span>
                        <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: journey.tier_color ? `${journey.tier_color}20` : "#f3f4f6",
                                color: journey.tier_color || "#6b7280",
                            }}
                        >
                            {journey.tier_name || `Level ${currentLevel}`}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{currentExp.toLocaleString()} XP</p>
                    <div className="w-full h-2.5 bg-violet-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                        {expToNextLevel.toLocaleString()} XP lagi ke Level {currentLevel + 1}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-lg p-2 text-center border border-violet-100/60">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{weeklyExp.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">XP Minggu Ini</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-violet-100/60">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{monthlyExp.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">XP Bulan Ini</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-violet-100/60">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{badgesEarned}</p>
                        <p className="text-[10px] text-gray-500">Badge</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
