"use client";

import { Users, Star, Crown, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { Guild } from "@/types/guild";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";

interface GuildCardProps {
    guild: Guild;
    onJoin?: (guildId: string) => void;
    isMemberOfAny?: boolean;
    myGuildId?: string;
}

export function GuildCard({ guild, onJoin, isMemberOfAny, myGuildId }: GuildCardProps) {
    const isFull = guild.member_count >= guild.max_members;
    const hasProfileImage = guild.icon && (guild.icon.startsWith("http") || guild.icon.startsWith("/"));
    const isMyGuild = myGuildId === guild.id;
    const canJoin = onJoin && !isMemberOfAny && !isFull && guild.is_public;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all flex flex-col"
        >
            {/* Profile Image Hero */}
            <Link href={ROUTES.guildDetail(guild.id)} className="block shrink-0">
                <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-primary/10 via-primary/5 to-violet-100 overflow-hidden">
                    {hasProfileImage ? (
                        <Image
                            src={guild.icon}
                            alt={guild.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Shield className="w-16 h-16 text-primary/20" />
                        </div>
                    )}

                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap w-[calc(100%-4rem)]">
                        <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-primary px-2 py-0.5 rounded-full shadow-sm">
                            Lv.{guild.level}
                        </span>
                        {!guild.is_public && (
                            <span className="text-[10px] font-medium bg-gray-800/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Privat
                            </span>
                        )}
                        {isMyGuild && (
                            <span className="text-[10px] font-medium bg-blue-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <Shield className="w-2.5 h-2.5" />
                                Guild Saya
                            </span>
                        )}
                    </div>
                    {isFull && (
                        <span className="absolute top-2 right-2 text-[10px] font-semibold bg-red-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full shadow-sm">
                            Penuh
                        </span>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="p-4 space-y-3 flex flex-col flex-1">
                <div className="flex-1">
                    <Link
                        href={ROUTES.guildDetail(guild.id)}
                        className="font-bold text-gray-800 hover:text-primary transition-colors text-base line-clamp-1"
                    >
                        {guild.name}
                    </Link>
                    {guild.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {guild.description}
                        </p>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-400">
                    <span className="flex items-center gap-1 shrink-0">
                        <Users className="w-3.5 h-3.5" />
                        {guild.member_count}/{guild.max_members}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5" />
                        {guild.total_xp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center gap-1 shrink-0 line-clamp-1">
                        <Crown className="w-3.5 h-3.5" />
                        {guild.leader_name}
                    </span>
                </div>

                {/* Action */}
                <div className="pt-2 mt-auto border-t border-gray-100/50">
                    {canJoin ? (
                        <button
                            onClick={() => onJoin(guild.id)}
                            className="w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Gabung Guild
                        </button>
                    ) : isMyGuild ? (
                        <Link
                            href={ROUTES.guildDetail(guild.id)}
                            className="block w-full py-2 rounded-xl bg-blue-50 text-center text-sm text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                        >
                            Masuk Guild
                        </Link>
                    ) : isMemberOfAny ? (
                        <div className="w-full py-2 rounded-xl bg-gray-50 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200">
                            Kamu sudah bergabung ke guild lain
                        </div>
                    ) : isFull ? (
                        <div className="w-full py-2 rounded-xl bg-red-50 text-center text-xs text-red-500 font-medium border border-dashed border-red-200">
                            Guild sudah penuh
                        </div>
                    ) : (
                        <Link
                            href={ROUTES.guildDetail(guild.id)}
                            className="block w-full py-2 rounded-xl bg-gray-50 text-center text-sm text-gray-600 font-medium hover:bg-gray-100 transition-colors border"
                        >
                            Lihat Detail
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
