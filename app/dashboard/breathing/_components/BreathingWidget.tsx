"use client";

import { BreathingWidgetData, getTechniqueIcon } from "@/types/breathing";
import { Flame, Wind, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils";

interface BreathingWidgetProps {
    data: BreathingWidgetData;
}

export function BreathingWidget({ data }: BreathingWidgetProps) {
    const progressPercent = Math.min(data.daily_goal_progress, 100);

    return (
        <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Latihan Pernapasan</h3>
                </div>
                <Link
                    href="/dashboard/breathing"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    Lihat semua
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Streak Alert */}
            {data.streak_at_risk && (
                <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-300 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-700">Streak dalam bahaya!</p>
                        <p className="text-xs text-muted-foreground">Latihan hari ini untuk menjaga streak</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <Flame className="w-4 h-4" />
                        <span className="text-xl font-bold">{data.current_streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Hari Streak</p>
                </div>

                <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-xl font-bold text-primary mb-1">
                        {data.today_sessions}
                    </div>
                    <p className="text-xs text-muted-foreground">Sesi Hari Ini</p>
                </div>

                <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xl font-bold">{data.today_minutes}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Menit</p>
                </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Target harian</span>
                    <span className="font-medium">{data.today_minutes}/{data.daily_goal_minutes} menit</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all",
                            progressPercent >= 100 ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Favorite Technique */}
            {data.favorite_technique && (
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Teknik favorit</p>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{
                                backgroundColor: `${data.favorite_technique.color}20`,
                                color: data.favorite_technique.color
                            }}
                        >
                            {getTechniqueIcon(data.favorite_technique)}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{data.favorite_technique.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {data.favorite_technique.inhale_duration}-
                                {data.favorite_technique.inhale_hold_duration}-
                                {data.favorite_technique.exhale_duration}-
                                {data.favorite_technique.exhale_hold_duration}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <Link
                href="/dashboard/breathing"
                className={cn(
                    "w-full py-3 rounded-lg font-medium text-center block transition-colors",
                    data.needs_practice_today
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80"
                )}
            >
                {data.needs_practice_today ? "Mulai Latihan" : "Latihan Lagi"}
            </Link>
        </div>
    );
}
