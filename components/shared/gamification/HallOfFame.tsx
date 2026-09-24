"use client";

import { cn } from "@/utils";
import { HallOfFameEntry, LevelHallOfFameResponse } from "@/types";
import { Users, Award, Zap } from "lucide-react";
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
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Award className="h-5 w-5 text-white" />
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
        <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-3.5 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-rose-50/35 hover:shadow-[0_14px_32px_-24px_rgba(220,38,38,0.3)] motion-reduce:transition-none">
            {/* Avatar */}
            <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
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
                <p className="truncate font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {entry.user_name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 transition-transform group-hover:scale-[1.03]">
                        <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
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
