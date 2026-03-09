"use client";

import { Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { GuildLeaderboardEntry } from "@/types/guild";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const GUILD_ICONS: Record<string, string> = {
    shield: "🛡️",
    sword: "⚔️",
    star: "⭐",
    heart: "❤️",
    fire: "🔥",
    crown: "👑",
    gem: "💎",
    leaf: "🍃",
    moon: "🌙",
    sun: "☀️",
};

interface GuildLeaderboardProps {
    entries: GuildLeaderboardEntry[];
}

export function GuildLeaderboard({ entries }: GuildLeaderboardProps) {
    if (entries.length === 0) {
        return (
            <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada guild untuk ditampilkan</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Top 3 podium */}
            {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[entries[1], entries[0], entries[2]].map((entry, idx) => {
                        const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                        const icon = GUILD_ICONS[entry.icon] || "🛡️";
                        return (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                            >
                                <Link
                                    href={ROUTES.guildDetail(entry.id)}
                                    className={`relative block bg-white rounded-xl border p-4 text-center hover:shadow-md transition-all hover:scale-[1.02] ${rank === 1 ? "border-yellow-300 ring-1 ring-yellow-200" : ""
                                        }`}
                                >
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"
                                        }`}>
                                        {rank}
                                    </div>
                                    <div className="text-2xl mt-2 mb-1">{icon}</div>
                                    <p className="font-semibold text-sm text-gray-800 truncate">{entry.name}</p>
                                    <p className="text-xs text-primary font-medium mt-1">{entry.total_xp.toLocaleString()} XP</p>
                                    <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
                                        <Users className="w-3 h-3" />
                                        {entry.member_count}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Rest of leaderboard */}
            {entries.slice(3).map((entry, i) => {
                const icon = GUILD_ICONS[entry.icon] || "🛡️";
                return (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                    >
                        <Link
                            href={ROUTES.guildDetail(entry.id)}
                            className="flex items-center gap-3 bg-white rounded-xl border p-3 hover:shadow-sm hover:border-primary/20 transition-all"
                        >
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                {entry.rank}
                            </span>
                            <span className="text-xl">{icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{entry.name}</p>
                                <p className="text-xs text-gray-400">Lv.{entry.level} · {entry.member_count} anggota</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-primary">{entry.total_xp.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">XP</p>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
