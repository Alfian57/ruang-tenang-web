"use client";

import { Star, Users, Crown, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import type { MyGuildInfo } from "@/types/guild";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";

const ROLE_LABELS: Record<string, string> = {
    leader: "Ketua",
    admin: "Wakil Ketua",
    member: "Anggota",
};

interface MyGuildBannerProps {
    myGuild: MyGuildInfo;
}

export function MyGuildBanner({ myGuild }: MyGuildBannerProps) {
    if (!myGuild.is_member || !myGuild.guild) return null;

    const { guild } = myGuild;
    const roleLabel = ROLE_LABELS[myGuild.member_role || "member"] || "Anggota";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-5"
        >            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Guild Profile Image */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                        {guild.icon && (guild.icon.startsWith("http") || guild.icon.startsWith("/")) ? (
                            <Image
                                src={guild.icon}
                                alt={guild.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-1">{guild.name}</h3>
                            <span className="text-[10px] sm:text-xs shrink-0 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                Lv.{guild.level}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1 shrink-0">
                                <Crown className="w-3.5 h-3.5" />
                                {roleLabel}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                                <Users className="w-3.5 h-3.5" />
                                {guild.member_count}/{guild.max_members}
                            </span>
                            <span className="flex items-center gap-1 shrink-0 truncate">
                                <Star className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{myGuild.xp_contributed.toLocaleString()} XP</span>
                            </span>
                        </div>
                    </div>
                </div>
                <Link
                    href={ROUTES.guildDetail(guild.id)}
                    className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
                >
                    Lihat Guild
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}
