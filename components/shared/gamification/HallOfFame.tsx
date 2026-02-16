"use client";

import { cn } from "@/utils";
import { HallOfFameEntry, LevelHallOfFameResponse } from "@/types";
import { Crown, Medal, Star, Flame } from "lucide-react";
import Image from "next/image";

interface HallOfFameProps {
    data: LevelHallOfFameResponse;
    className?: string;
}

export function HallOfFame({ data, className }: HallOfFameProps) {
    return (
        <div className={cn("bg-card rounded-xl border shadow-sm", className)}>
            {/* Header */}
            <div
                className="p-4 rounded-t-xl text-white"
                style={{ backgroundColor: data.tier_color }}
            >
                <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    <h3 className="font-semibold">Hall of Fame - Level {data.level}</h3>
                </div>
                <p className="text-sm opacity-90">{data.tier_name}</p>
            </div>

            {/* Entries */}
            <div className="p-4 space-y-3">
                {data.entries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        Belum ada anggota di level ini
                    </p>
                ) : (
                    data.entries.map((entry, index) => (
                        <HallOfFameEntryCard
                            key={entry.user_id}
                            entry={entry}
                            rank={index + 1}
                            tierColor={data.tier_color}
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
    tierColor: string;
}

function HallOfFameEntryCard({ entry, rank, tierColor }: HallOfFameEntryCardProps) {
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
            <div className="relative">
                <Image
                    src={entry.avatar || "/images/default-avatar.png"}
                    alt={entry.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    style={{ borderColor: tierColor, borderWidth: 2 }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {entry.exp.toLocaleString()} EXP
                    </span>
                    <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.current_streak} hari
                    </span>
                </div>
            </div>

            {/* Badges */}
            {entry.badges_earned.length > 0 && (
                <div className="flex -space-x-1">
                    {entry.badges_earned.slice(0, 3).map((badge, i) => (
                        <span key={i} className="text-lg" title={badge}>
                            {badge}
                        </span>
                    ))}
                    {entry.badges_earned.length > 3 && (
                        <span className="text-xs text-muted-foreground ml-1">
                            +{entry.badges_earned.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
