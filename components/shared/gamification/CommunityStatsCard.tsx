"use client";

import { cn } from "@/utils";
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
            value: stats.active_members,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-100",
        },
        {
            label: "Anggota Baru",
            value: stats.new_members,
            icon: Activity,
            color: "text-green-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-100",
        },
        {
            label: "Total XP",
            value: Number(stats.total_xp_earned || 0).toLocaleString(),
            icon: Zap,
            color: "text-amber-500",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-100",
        },
        {
            label: "Pencapaian",
            value: stats.total_achievements,
            icon: Trophy,
            color: "text-purple-500",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-100",
        },
        {
            label: "Cerita",
            value: stats.total_stories_published,
            icon: BookOpen,
            color: "text-pink-500",
            bgColor: "bg-pink-50",
            borderColor: "border-pink-100",
        },
        {
            label: "Artikel",
            value: stats.total_articles_published,
            icon: Heart,
            color: "text-rose-500",
            bgColor: "bg-rose-50",
            borderColor: "border-rose-100",
        },
    ];

    return (
        <div className={cn("grid grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6", className)}>
            {statItems.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "bg-white rounded-xl p-3 border shadow-xs flex items-center gap-3 transition-colors hover:bg-gray-50",
                        item.borderColor
                    )}
                >
                    <div className={cn("p-2 rounded-lg shrink-0", item.bgColor)}>
                        <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.value}</p>
                        <p className="text-[11px] font-medium text-gray-500 truncate">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
