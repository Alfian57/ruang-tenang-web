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
            subtext: "bulan ini",
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            label: "Anggota Baru",
            value: stats.new_members,
            subtext: `+${stats.growth_percentage}% pertumbuhan`,
            icon: Activity,
            color: "text-green-500",
            bgColor: "bg-green-50",
        },
        {
            label: "Total XP Komunitas",
            value: Number(stats.total_xp_earned || 0).toLocaleString(),
            subtext: "dikumpulkan bersama",
            icon: Zap,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50",
        },
        {
            label: "Pencapaian",
            value: stats.total_achievements,
            subtext: "badge & prestasi",
            icon: Trophy,
            color: "text-purple-500",
            bgColor: "bg-purple-50",
        },
        {
            label: "Cerita Dibagikan",
            value: stats.total_stories_published,
            subtext: "kisah inspirasi",
            icon: BookOpen,
            color: "text-pink-500",
            bgColor: "bg-pink-50",
        },
        {
            label: "Artikel Ditulis",
            value: stats.total_articles_published,
            subtext: "konten edukasi",
            icon: Heart,
            color: "text-rose-500",
            bgColor: "bg-rose-50",
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
