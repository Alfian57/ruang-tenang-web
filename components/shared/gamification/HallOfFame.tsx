"use client";

import { cn } from "@/utils";
import { HallOfFameEntry, LevelHallOfFameResponse } from "@/types";
import { Users, Star } from "lucide-react";
import Image from "next/image";

interface HallOfFameProps {
    data: LevelHallOfFameResponse;
    className?: string;
    hideTierName?: boolean;
}

export function HallOfFame({ data, className, hideTierName = false }: HallOfFameProps) {
    const entries = Array.isArray(data?.featured_users) ? data.featured_users : [];

    return (
        <div className={cn("bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
            {/* Header */}
            <div
                className="p-4 md:p-5 text-white relative overflow-hidden"
                style={{
                    backgroundImage: "linear-gradient(to right, var(--theme-gradient-from, #ef4444), var(--theme-gradient-to, #f97316))"
                }}
            >
                {/* Decorative background elements matching the landing page theme */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Star className="h-5 w-5 text-white fill-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Apresiasi Komunitas - Level {data.level}</h3>
                            {!hideTierName && data.total_members > 0 && (
                                <p className="text-sm text-white/90 font-medium">{data.total_members} anggota telah mencapai level ini</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Entries */}
            <div className="p-4 md:p-5">
                {entries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-600 mb-1">Belum ada anggota</h3>
                        <p className="text-sm text-gray-400">Jadilah yang pertama mencapai level ini!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {entries.map((entry) => (
                            <HallOfFameEntryCard
                                key={entry.user_id}
                                entry={entry}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface HallOfFameEntryCardProps {
    entry: HallOfFameEntry;
}

function HallOfFameEntryCard({ entry }: HallOfFameEntryCardProps) {
    const monthlyXp = Number(entry.monthly_xp ?? 0);
    const badgeColor = entry.tier_color || "#ef4444"; // Fallback to primary red

    return (
        <div className="group flex items-center gap-4 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-red-200 hover:shadow-md hover:bg-red-50/30 transition-all duration-300 relative overflow-hidden">
            {/* Left accent bar on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Avatar */}
            <div
                className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                style={{ backgroundColor: `${badgeColor}15` }}
            >
                {entry.avatar ? (
                    <Image
                        src={entry.avatar}
                        alt={entry.user_name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-full h-full"
                    />
                ) : (
                    <span className="font-bold text-lg" style={{ color: badgeColor }}>
                        {entry.user_name?.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                    {entry.user_name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {monthlyXp.toLocaleString()} EXP
                    </span>
                    {entry.tier_name && (
                        <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border truncate max-w-24"
                            style={{
                                color: badgeColor,
                                backgroundColor: `${badgeColor}10`,
                                borderColor: `${badgeColor}25`
                            }}
                        >
                            {entry.tier_name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
