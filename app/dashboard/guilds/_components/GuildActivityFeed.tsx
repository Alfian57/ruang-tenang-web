"use client";

import {
    UserPlus,
    UserMinus,
    ShieldCheck,
    Target,
    CheckCircle2,
    Star,
    Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import type { GuildActivity } from "@/types/guild";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const ACTIVITY_ICONS: Record<string, typeof UserPlus> = {
    guild_created: Shield,
    member_joined: UserPlus,
    member_left: UserMinus,
    member_kicked: UserMinus,
    member_promoted: ShieldCheck,
    challenge_created: Target,
    challenge_completed: CheckCircle2,
    xp_contributed: Star,
};

const ACTIVITY_COLORS: Record<string, string> = {
    guild_created: "text-primary bg-primary/10",
    member_joined: "text-green-600 bg-green-50",
    member_left: "text-gray-500 bg-gray-100",
    member_kicked: "text-red-500 bg-red-50",
    member_promoted: "text-blue-500 bg-blue-50",
    challenge_created: "text-purple-500 bg-purple-50",
    challenge_completed: "text-green-600 bg-green-50",
    xp_contributed: "text-yellow-600 bg-yellow-50",
};

interface GuildActivityFeedProps {
    activities: GuildActivity[];
}

export function GuildActivityFeed({ activities }: GuildActivityFeedProps) {
    if (activities.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-gray-400">Belum ada aktivitas</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.activity_type] || Star;
                const color = ACTIVITY_COLORS[activity.activity_type] || "text-gray-500 bg-gray-100";

                return (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * activities.indexOf(activity), duration: 0.3 }}
                        className="flex items-start gap-3"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                {activity.username && <span>@{activity.username}</span>}
                                <span>
                                    {formatDistanceToNow(new Date(activity.created_at), {
                                        addSuffix: true,
                                        locale: idLocale,
                                    })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
