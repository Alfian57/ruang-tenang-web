"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CommunityStatsCard } from "@/components/shared/gamification";
import { DailyTaskWidget } from "@/components/shared/gamification";
import { Users, HeartHandshake, Flame, CheckCircle2, PenLine, MessageCircle, Wind, ArrowRight } from "lucide-react";
import { useCommunityData } from "./_hooks/useCommunityData";
import {
    CommunitySkeleton,
    CommunityAuthContent,
    LatestDiscussions,
} from "./_components";

export default function DashboardCommunityPage() {
    const {
        communityStats,
        personalJourney,
        hallOfFame,
        latestForums,
        currentLevel,
        maxLevel,
        userBadges,
        dailyTasks,
        loading,
        isLevelChanging,
        handleLevelChange,
        refreshDailyTasks,
    } = useCommunityData();

    const completedDailyTasks = dailyTasks.filter((task) => task.is_completed).length;
    const claimedDailyTasks = dailyTasks.filter((task) => task.is_claimed).length;
    const claimableDailyTasks = dailyTasks.filter((task) => task.is_completed && !task.is_claimed).length;
    const taskCompletionProgress = dailyTasks.length > 0
        ? Math.round((completedDailyTasks / dailyTasks.length) * 100)
        : 0;

    const creativeMissions = [
        {
            key: "reflective-note",
            title: "Misi Refleksi 3 Menit",
            description: "Tulis 3 kalimat refleksi singkat lalu bagikan insight yang aman ke komunitas.",
            href: "/dashboard/journal/create?mode=structured-reflection&context=story-weekly-challenge",
            icon: PenLine,
        },
        {
            key: "supportive-reply",
            title: "Misi Dukungan Empatik",
            description: "Balas satu diskusi komunitas dengan respons empatik yang konstruktif.",
            href: "/dashboard/forum",
            icon: MessageCircle,
        },
        {
            key: "calm-reset",
            title: "Misi Reset Tenang",
            description: "Selesaikan 1 sesi pernafasan dan catat perubahan mood setelahnya.",
            href: "/dashboard/breathing",
            icon: Wind,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6 space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Komunitas</h1>
                <p className="text-gray-500 mt-1 text-lg">
                    Pantau perjalananmu dan lihat perkembangan komunitas.
                </p>
            </div>

            {loading ? (
                <CommunitySkeleton />
            ) : (
                <>
                    {communityStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-2"
                        >
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Pencapaian Komunitas
                            </h2>
                            <CommunityStatsCard stats={communityStats} />
                        </motion.div>
                    )}

                    <motion.section
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="grid grid-cols-1 xl:grid-cols-3 gap-4"
                    >
                        <div className="xl:col-span-2 space-y-3">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 inline-flex items-center gap-2">
                                            <HeartHandshake className="w-4 h-4" />
                                            COMMUNITY-1 · Shared Healing Missions
                                        </p>
                                        <h2 className="text-lg font-semibold text-gray-900 mt-1">Misi Harian Komunitasmu</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Selesaikan misi kecil, klaim reward, dan dorong ritme pemulihan bersama.
                                        </p>
                                    </div>
                                    {claimableDailyTasks > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {claimableDailyTasks} siap klaim
                                        </span>
                                    )}
                                </div>
                            </div>

                            {dailyTasks.length > 0 ? (
                                <DailyTaskWidget tasks={dailyTasks} onTaskClaimed={refreshDailyTasks} />
                            ) : (
                                <div className="rounded-xl border border-dashed bg-white p-6 text-sm text-gray-500">
                                    Misi harian belum tersedia saat ini. Coba muat ulang beberapa saat lagi.
                                </div>
                            )}

                            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Creative Mission Board</p>
                                <p className="text-sm text-gray-700 mt-1">
                                    Variasi misi ini dirancang agar kontribusi komunitas tidak monoton dan tetap terasa personal.
                                </p>
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {creativeMissions.map((mission) => (
                                        <Link key={mission.key} href={mission.href} className="rounded-xl border border-violet-200 bg-white p-3 hover:bg-violet-100 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 grid place-items-center">
                                                <mission.icon className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 mt-2">{mission.title}</p>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{mission.description}</p>
                                            <span className="text-[11px] font-semibold text-violet-700 mt-2 inline-flex items-center gap-1">
                                                Jalankan Misi
                                                <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-4 space-y-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 inline-flex items-center gap-2">
                                    <Flame className="w-4 h-4" />
                                    Hall of Impact
                                </p>
                                <h3 className="text-base font-semibold text-gray-900 mt-1">Dampak Harian Komunitas</h3>
                            </div>

                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-500">Progress misi harian</p>
                                <p className="text-lg font-bold text-gray-900 mt-0.5">{taskCompletionProgress}%</p>
                                <p className="text-xs text-gray-500 mt-1">{completedDailyTasks}/{dailyTasks.length || 0} misi selesai • {claimedDailyTasks} sudah diklaim</p>
                            </div>

                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-500">Aktivitas anggota baru</p>
                                <p className="text-lg font-bold text-gray-900 mt-0.5">+{communityStats?.new_members || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">member bergabung di periode ini</p>
                            </div>

                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                <p className="text-xs text-gray-500">Total energi komunitas</p>
                                <p className="text-lg font-bold text-gray-900 mt-0.5">{Number(communityStats?.total_xp_earned || 0).toLocaleString()} XP</p>
                                <p className="text-xs text-gray-500 mt-1">akumulasi kontribusi healing bersama</p>
                            </div>
                        </div>
                    </motion.section>

                    <CommunityAuthContent
                        personalJourney={personalJourney}
                        hallOfFame={hallOfFame}
                        userBadges={userBadges}
                        currentLevel={currentLevel}
                        maxLevel={maxLevel}
                        isLevelChanging={isLevelChanging}
                        onLevelChange={handleLevelChange}
                    />

                    <LatestDiscussions forums={latestForums} />
                </>
            )}
        </div>
    );
}
