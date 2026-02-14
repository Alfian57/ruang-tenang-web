"use client";

import { cn } from "@/lib/utils";
import { CommunityStats } from "@/types";
import { Users, Activity, Trophy, Zap, Heart, BookOpen } from "lucide-react";

interface CommunityStatsCardProps {
    stats: CommunityStats;
    className?: string;
}

export function CommunityStatsCard({ stats, className }: CommunityStatsCardProps) {
    const statItems = [
        {
            label: "Anggota Aktif",
            value: stats.active_users_weekly,
            subtext: "minggu ini",
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            label: "Total Aktivitas",
            value: stats.total_activities,
            subtext: `+${stats.milestones_reached} milestone`,
            icon: Activity,
            color: "text-green-500",
            bgColor: "bg-green-50",
        },
        {
            label: "EXP Dikumpulkan",
            value: stats.exp_earned_this_week.toLocaleString(),
            subtext: "minggu ini",
            icon: Zap,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50",
        },
        {
            label: "Badge Diraih",
            value: stats.badges_earned,
            subtext: "oleh komunitas",
            icon: Trophy,
            color: "text-purple-500",
            bgColor: "bg-purple-50",
        },
        {
            label: "Cerita Dibagikan",
            value: stats.stories_shared,
            subtext: "kisah inspirasi",
            icon: BookOpen,
            color: "text-pink-500",
            bgColor: "bg-pink-50",
        },
        {
            label: "Hati Diberikan",
            value: stats.supportive_hearts_given,
            subtext: "dukungan",
            icon: Heart,
            color: "text-red-500",
            bgColor: "bg-red-50",
        },
    ];

    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
            {statItems.map((item, index) => (
                <div
                    key={index}
                    className="bg-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className={cn("p-2 rounded-lg", item.bgColor)}>
                            <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground/70">{item.subtext}</p>
                </div>
            ))}
        </div>
    );
}
