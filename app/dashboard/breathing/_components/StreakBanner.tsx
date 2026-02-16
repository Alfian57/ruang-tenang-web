import { Flame } from "lucide-react";
import { cn } from "@/utils";

interface StreakBannerProps {
    currentStreak: number;
    streakAtRisk?: boolean;
    needsPractice?: boolean;
}

export function StreakBanner({ currentStreak, streakAtRisk, needsPractice }: StreakBannerProps) {
    if (currentStreak === 0 && !needsPractice) return null;

    return (
        <div className={cn(
            "p-4 rounded-xl flex items-center gap-4",
            streakAtRisk
                ? "bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-300"
                : currentStreak >= 7
                    ? "bg-linear-to-r from-orange-500/20 to-red-500/20 border border-orange-300"
                    : "bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20"
        )}>
            <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                streakAtRisk ? "bg-amber-500" : currentStreak >= 7 ? "bg-orange-500" : "bg-primary"
            )}>
                <Flame className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
                <h3 className={cn(
                    "font-semibold text-lg",
                    streakAtRisk ? "text-amber-700" : currentStreak >= 7 ? "text-orange-700" : "text-primary"
                )}>
                    {streakAtRisk
                        ? "Streak dalam bahaya!"
                        : currentStreak >= 7
                            ? `🔥 ${currentStreak} Hari Berturut-turut!`
                            : `${currentStreak} Hari Streak`}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {streakAtRisk
                        ? "Latihan hari ini untuk menjaga streak kamu"
                        : needsPractice
                            ? "Latihan hari ini untuk melanjutkan streak"
                            : "Pertahankan semangat bernapasmu!"}
                </p>
            </div>
        </div>
    );
}
