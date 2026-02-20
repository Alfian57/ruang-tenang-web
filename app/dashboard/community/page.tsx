"use client";

import { motion } from "framer-motion";
import { CommunityStatsCard } from "@/components/shared/gamification";
import { Users } from "lucide-react";
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
        userBadges,
        loading,
        handleLevelChange,
    } = useCommunityData();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-8">
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

                    <CommunityAuthContent
                        personalJourney={personalJourney}
                        hallOfFame={hallOfFame}
                        userBadges={userBadges}
                        currentLevel={currentLevel}
                        onLevelChange={handleLevelChange}
                    />
                </>
            )}
        </div>
    );
}
