"use client";

import { Target, Clock, Trophy, Coins, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { GuildChallenge } from "@/types/guild";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
    total_xp: "Total XP",
    total_tasks: "Total Tugas",
    total_breathing: "Total Pernafasan",
    total_journals: "Total Jurnal",
    total_chats: "Total Chat",
    total_streak_days: "Total Hari Streak",
};

const CHALLENGE_TYPE_ICONS: Record<string, string> = {
    total_xp: "⭐",
    total_tasks: "📋",
    total_breathing: "🌬️",
    total_journals: "📖",
    total_chats: "💬",
    total_streak_days: "🔥",
};

interface GuildChallengeCardProps {
    challenge: GuildChallenge;
}

export function GuildChallengeCard({ challenge }: GuildChallengeCardProps) {
    const typeLabel = CHALLENGE_TYPE_LABELS[challenge.challenge_type] || challenge.challenge_type;
    const typeIcon = CHALLENGE_TYPE_ICONS[challenge.challenge_type] || "🎯";
    const progressPercent = Math.min(challenge.progress_percent, 100);

    const timeLeft = challenge.is_active
        ? formatDistanceToNow(new Date(challenge.ends_at), { addSuffix: false, locale: idLocale })
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl border p-4 ${challenge.is_completed ? "border-green-200 bg-green-50/30" :
                challenge.is_expired ? "border-red-200 bg-red-50/30 opacity-60" :
                    "hover:shadow-md hover:border-primary/20 transition-all"
                }`}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {typeIcon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 truncate">{challenge.title}</h4>
                        {challenge.is_completed && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                        {challenge.is_expired && !challenge.is_completed && (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                    </div>
                    {challenge.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{challenge.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">
                                <Target className="w-3 h-3 inline mr-1" />
                                {typeLabel}
                            </span>
                            <span className="font-medium text-gray-700">
                                {challenge.current_value.toLocaleString()} / {challenge.target_value.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                                className={`h-2.5 rounded-full ${challenge.is_completed ? "bg-green-500" :
                                        challenge.is_expired ? "bg-red-400" :
                                            "bg-linear-to-r from-primary to-violet-500"
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-xs text-right text-gray-400 mt-0.5">
                            {progressPercent.toFixed(0)}%
                        </p>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {timeLeft && challenge.is_active && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Sisa {timeLeft}
                            </span>
                        )}
                        {challenge.is_completed && (
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Selesai
                            </span>
                        )}
                        {challenge.is_expired && !challenge.is_completed && (
                            <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle className="w-3 h-3" />
                                Kedaluwarsa
                            </span>
                        )}
                        {challenge.xp_reward > 0 && (
                            <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {challenge.xp_reward} XP
                            </span>
                        )}
                        {challenge.coin_reward > 0 && (
                            <span className="flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                {challenge.coin_reward} Koin
                            </span>
                        )}
                    </div>

                    {/* Top contributors */}
                    {challenge.top_contributors && challenge.top_contributors.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-gray-500 mb-2">Kontributor Teratas</p>
                            <div className="flex flex-wrap gap-2">
                                {challenge.top_contributors.map((c, i) => (
                                    <div key={c.user_id} className="flex items-center gap-1.5 text-xs bg-gray-50 rounded-full px-2 py-1">
                                        <span className="font-medium text-gray-600">#{i + 1}</span>
                                        <span className="text-gray-500">{c.name || c.username}</span>
                                        <span className="text-primary font-medium">{c.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
