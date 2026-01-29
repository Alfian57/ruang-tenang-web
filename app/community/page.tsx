"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Navbar, Footer } from "@/components/landing";
import { useAuthStore } from "@/stores/authStore";
import {
    CommunityStatsCard,
    PersonalJourneyCard,
    HallOfFame,
    BadgeShowcase,
    UserFeaturesOverview
} from "@/components/gamification";
import {
    CommunityStats,
    PersonalJourney,
    LevelHallOfFameResponse,
    UserBadges,
    UserFeatures
} from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Trophy,
    Star,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    LogIn
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
    const { token } = useAuthStore();
    const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
    const [personalJourney, setPersonalJourney] = useState<PersonalJourney | null>(null);
    const [hallOfFame, setHallOfFame] = useState<LevelHallOfFameResponse | null>(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
    const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch community stats (public)
                const statsRes = await api.getCommunityStats();
                setCommunityStats(statsRes.data);

                // Fetch authenticated user data
                if (token) {
                    const [journeyRes, badgesRes, featuresRes] = await Promise.all([
                        api.getPersonalJourney(token).catch(() => null),
                        api.getUserBadges(token).catch(() => null),
                        api.getUserFeatures(token).catch(() => null),
                    ]);

                    if (journeyRes?.data) {
                        setPersonalJourney(journeyRes.data);
                        setCurrentLevel(journeyRes.data.current_level);
                    }
                    if (badgesRes?.data) setUserBadges(badgesRes.data);
                    if (featuresRes?.data) setUserFeatures(featuresRes.data);
                }

                // Fetch hall of fame for current level
                const hofRes = await api.getLevelHallOfFame(currentLevel);
                setHallOfFame(hofRes.data);
            } catch (error) {
                console.error("Failed to fetch community data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, currentLevel]);

    const handleLevelChange = async (newLevel: number) => {
        if (newLevel < 1 || newLevel > 10) return;
        setCurrentLevel(newLevel);
        try {
            const hofRes = await api.getLevelHallOfFame(newLevel);
            setHallOfFame(hofRes.data);
        } catch (error) {
            console.error("Failed to fetch hall of fame:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="back" />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute top-20 left-0 w-100 h-100 bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <main className="pt-32 pb-20 container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Komunitas <span className="text-primary">Ruang Tenang</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground max-w-2xl mx-auto text-lg"
                    >
                        Tempat kita tumbuh bersama. Rayakan pencapaian, dukung perjalanan satu sama lain,
                        dan jadilah bagian dari komunitas yang penuh empati.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Community Stats */}
                        {communityStats && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-12"
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Pencapaian Komunitas
                                </h2>
                                <CommunityStatsCard stats={communityStats} />
                            </motion.div>
                        )}

                        {/* Login Prompt for non-authenticated users */}
                        {!token && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-card rounded-xl border p-8 text-center mb-12"
                            >
                                <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    Masuk untuk Melihat Perjalananmu
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Dapatkan akses ke statistik personal, badge, dan fitur eksklusif!
                                </p>
                                <Link href="/login">
                                    <Button size="lg">Masuk Sekarang</Button>
                                </Link>
                            </motion.div>
                        )}

                        {/* Authenticated User Content */}
                        {token && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
                                    <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                                        <TabsTrigger value="overview" className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            <span className="hidden sm:inline">Overview</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="journey" className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span className="hidden sm:inline">Perjalanan</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="badges" className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4" />
                                            <span className="hidden sm:inline">Badge</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="features" className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            <span className="hidden sm:inline">Fitur</span>
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Overview Tab */}
                                    <TabsContent value="overview">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {personalJourney && (
                                                <PersonalJourneyCard journey={personalJourney} />
                                            )}
                                            {hallOfFame && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-semibold flex items-center gap-2">
                                                            <Trophy className="h-5 w-5 text-yellow-500" />
                                                            Hall of Fame
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleLevelChange(currentLevel - 1)}
                                                                disabled={currentLevel <= 1}
                                                                className="p-1 rounded hover:bg-muted disabled:opacity-50"
                                                            >
                                                                <ChevronLeft className="h-5 w-5" />
                                                            </button>
                                                            <span className="text-sm">Level {currentLevel}</span>
                                                            <button
                                                                onClick={() => handleLevelChange(currentLevel + 1)}
                                                                disabled={currentLevel >= 10}
                                                                className="p-1 rounded hover:bg-muted disabled:opacity-50"
                                                            >
                                                                <ChevronRight className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <HallOfFame data={hallOfFame} />
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Journey Tab */}
                                    <TabsContent value="journey">
                                        {personalJourney && (
                                            <div className="max-w-2xl mx-auto">
                                                <PersonalJourneyCard journey={personalJourney} />
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Badges Tab */}
                                    <TabsContent value="badges">
                                        {userBadges && <BadgeShowcase badges={userBadges} />}
                                    </TabsContent>

                                    {/* Features Tab */}
                                    <TabsContent value="features">
                                        {userFeatures && (
                                            <div className="max-w-2xl mx-auto">
                                                <UserFeaturesOverview features={userFeatures} />
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        )}

                        {/* Public Hall of Fame (for non-authenticated users) */}
                        {!token && hallOfFame && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        Hall of Fame
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleLevelChange(currentLevel - 1)}
                                            disabled={currentLevel <= 1}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <span className="text-sm">Level {currentLevel}</span>
                                        <button
                                            onClick={() => handleLevelChange(currentLevel + 1)}
                                            disabled={currentLevel >= 10}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="max-w-xl">
                                    <HallOfFame data={hallOfFame} />
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
