"use client";

import { Star, Users, Crown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { MyGuildInfo } from "@/types/guild";
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

const ROLE_LABELS: Record<string, string> = {
    leader: "Leader",
    admin: "Admin",
    member: "Member",
};

interface MyGuildBannerProps {
    myGuild: MyGuildInfo;
}

export function MyGuildBanner({ myGuild }: MyGuildBannerProps) {
    if (!myGuild.is_member || !myGuild.guild) return null;

    const { guild } = myGuild;
    const icon = GUILD_ICONS[guild.icon] || "🛡️";
    const roleLabel = ROLE_LABELS[myGuild.member_role || "member"] || "Member";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-5"
        >            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-3xl">
                        {icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-800">{guild.name}</h3>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                Lv.{guild.level}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Crown className="w-3.5 h-3.5" />
                                {roleLabel}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {guild.member_count}/{guild.max_members}
                            </span>
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5" />
                                {myGuild.xp_contributed.toLocaleString()} XP kontribusi
                            </span>
                        </div>
                    </div>
                </div>
                <Link
                    href={ROUTES.guildDetail(guild.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Lihat Guild
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}
