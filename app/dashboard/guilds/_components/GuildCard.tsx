"use client";

import { Shield, Users, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Guild } from "@/types/guild";
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

interface GuildCardProps {
    guild: Guild;
    onJoin?: (guildId: string) => void;
    isMemberOfAny?: boolean;
}

export function GuildCard({ guild, onJoin, isMemberOfAny }: GuildCardProps) {
    const icon = GUILD_ICONS[guild.icon] || "🛡️";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-primary/20 transition-all"
        >            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl shrink-0">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link
                            href={ROUTES.guildDetail(guild.id)}
                            className="font-semibold text-gray-800 hover:text-primary truncate"
                        >
                            {guild.name}
                        </Link>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                            Lv.{guild.level}
                        </span>
                    </div>
                    {guild.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {guild.description}
                        </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {guild.member_count}/{guild.max_members}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            {guild.total_xp.toLocaleString()} XP
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" />
                            {guild.leader_name}
                        </span>
                    </div>
                </div>
                <div className="shrink-0">
                    {onJoin && !isMemberOfAny && guild.member_count < guild.max_members ? (
                        <button
                            onClick={() => onJoin(guild.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Gabung
                        </button>
                    ) : (
                        <Link
                            href={ROUTES.guildDetail(guild.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors block"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
