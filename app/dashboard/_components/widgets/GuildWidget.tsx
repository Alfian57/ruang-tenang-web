"use client";

import { useEffect, useState } from "react";
import { guildService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { MyGuildInfo } from "@/types/guild";
import { Swords, Users, Star, Crown, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GUILD_ICONS: Record<string, string> = {
    shield: "🛡️", sword: "⚔️", star: "⭐", heart: "❤️", fire: "🔥",
    crown: "👑", gem: "💎", leaf: "🍃", moon: "🌙", sun: "☀️",
};

const ROLE_LABELS: Record<string, string> = {
    leader: "Leader", admin: "Admin", member: "Member",
};

export function GuildWidget() {
    const { token } = useAuthStore();
    const [myGuild, setMyGuild] = useState<MyGuildInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        guildService.getMyGuild(token)
            .then((res) => { if (res.data) setMyGuild(res.data); })
            .catch(() => { /* non-critical widget */ })
            .finally(() => setIsLoading(false));
    }, [token]);

    if (isLoading) {
        return (
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    // User is in a guild — show compact guild info
    if (myGuild?.is_member && myGuild.guild) {
        const { guild } = myGuild;
        const icon = GUILD_ICONS[guild.icon] || "🛡️";
        const roleLabel = ROLE_LABELS[myGuild.member_role || "member"] || "Member";

        return (
            <Card className="border border-primary/20 shadow-sm bg-linear-to-br from-primary/5 to-transparent overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                        <Swords className="w-4 h-4 text-primary" />
                        Guild Kamu
                    </CardTitle>
                    <Link href={ROUTES.guildDetail(guild.id)}>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary h-7 px-2">
                            Detail <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0">
                            {icon}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-semibold text-gray-900 text-sm truncate">{guild.name}</h4>
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium shrink-0">
                                    Lv.{guild.level}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 mt-0.5 text-xs text-gray-500">
                                <span className="flex items-center gap-0.5">
                                    <Crown className="w-3 h-3" /> {roleLabel}
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <Users className="w-3 h-3" /> {guild.member_count}/{guild.max_members}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-white/70 border border-primary/10 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500">Kontribusi XP</span>
                        <span className="text-sm font-bold text-primary flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            {myGuild.xp_contributed.toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // User is not in a guild — show CTA
    return (
        <Card className="border border-gray-100 shadow-sm bg-linear-to-br from-amber-50/50 to-orange-50/30 overflow-hidden relative">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-amber-100 rounded-xl">
                        <Swords className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            Bergabung dengan Guild!
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Selesaikan tantangan bersama teman
                        </p>
                    </div>
                </div>
                <Link href={ROUTES.GUILDS}>
                    <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white border-none gap-1.5 h-8 text-xs">
                        <Swords className="w-3.5 h-3.5" />
                        Jelajahi Guild
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
