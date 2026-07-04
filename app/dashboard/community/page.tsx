"use client";

import { motion } from "framer-motion";
import { CommunityStatsCard } from "@/components/shared/gamification";
import { Users, Flame } from "lucide-react";
import { useCommunityData } from "./_hooks/useCommunityData";
import {
    CommunitySkeleton,
    CommunityAuthContent,
} from "./_components";

export default function DashboardCommunityPage() {
    const {
        communityStats,
        personalJourney,
        hallOfFame,
        currentLevel,
        maxLevel,
        userBadges,
        loading,
        isLevelChanging,
        handleLevelChange,
    } = useCommunityData();

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
                        className="rounded-xl border bg-white p-4 space-y-3"
                    >
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary inline-flex items-center gap-2">
                                <Flame className="w-4 h-4" />
                                Hall of Impact
                            </p>
                            <h3 className="text-base font-semibold text-gray-900 mt-1">Dampak Harian Komunitas</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </>
            )}
        </div>
    );
}
