"use client";

import { cn } from "@/utils";
import { HallOfFameEntry, LevelHallOfFameResponse } from "@/types";
import { Crown, Medal, Star } from "lucide-react";
import Image from "next/image";

interface HallOfFameProps {
    data: LevelHallOfFameResponse;
    className?: string;
    hideTierName?: boolean;
}

export function HallOfFame({ data, className, hideTierName = false }: HallOfFameProps) {
    const entries = Array.isArray(data?.featured_users) ? data.featured_users : [];

    return (
        <div className={cn("bg-card rounded-xl border shadow-sm", className)}>
            {/* Header */}
            <div
                className="p-4 rounded-t-xl text-white bg-gradient-to-r from-yellow-500 to-amber-600"
            >
                <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    <h3 className="font-semibold">Hall of Fame - Level {data.level}</h3>
                </div>
                {!hideTierName && data.total_members > 0 && (
                    <p className="text-sm opacity-90">{data.total_members} anggota di level ini</p>
                )}
            </div>

            {/* Entries */}
            <div className="p-4 space-y-3">
                {entries.length === 0 ? (
                    <div className="text-center py-16">
                        <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Belum ada anggota di level ini</h3>
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <HallOfFameEntryCard
                            key={entry.user_id}
                            entry={entry}
                            rank={entry.rank || index + 1}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

interface HallOfFameEntryCardProps {
    entry: HallOfFameEntry;
    rank: number;
}

function HallOfFameEntryCard({ entry, rank }: HallOfFameEntryCardProps) {
    const monthlyXp = Number(entry.monthly_xp ?? 0);

    const getRankIcon = () => {
        switch (rank) {
            case 1:
                return <Medal className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            {/* Rank */}
            <div className="w-8 flex justify-center">
                {getRankIcon()}
            </div>

            {/* Avatar */}
            <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden" style={{ borderColor: entry.tier_color || "#8b5cf6", borderWidth: 2 }}>
                {entry.avatar ? (
                    <Image
                        src={entry.avatar}
                        alt={entry.user_name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <span className="text-primary font-bold text-sm">{entry.user_name?.charAt(0).toUpperCase()}</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.user_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {monthlyXp.toLocaleString()} XP
                    </span>
                    {entry.tier_name && (
                        <span
                            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: `${entry.tier_color}20`, color: entry.tier_color }}
                        >
                            {entry.tier_name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
