"use client";

import { motion } from "framer-motion";
import {
    PersonalJourneyCard,
    HallOfFame,
    BadgeShowcase,
    UserFeaturesOverview,
    XPVisualizationsSection,
} from "@/components/shared/gamification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Trophy,
    Star,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    BarChart3,
} from "lucide-react";
import type {
    PersonalJourney,
    LevelHallOfFameResponse,
    UserBadges,
    UserFeatures,
} from "@/types";
import { useState } from "react";

interface CommunityAuthContentProps {
    personalJourney: PersonalJourney | null;
    hallOfFame: LevelHallOfFameResponse | null;
    userBadges: UserBadges | null;
    userFeatures: UserFeatures | null;
    currentLevel: number;
    onLevelChange: (level: number) => void;
}

export function CommunityAuthContent({
    personalJourney,
    hallOfFame,
    userBadges,
    userFeatures,
    currentLevel,
    onLevelChange,
}: CommunityAuthContentProps) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
                <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto mb-8">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="journey" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Perjalanan</span>
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Statistik</span>
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

                <TabsContent value="overview">
                    <div className="grid md:grid-cols-2 gap-8">
                        {personalJourney && <PersonalJourneyCard journey={personalJourney} />}
                        {hallOfFame && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        Hall of Fame
                                    </h3>
                                    <LevelNavigator
                                        currentLevel={currentLevel}
                                        onLevelChange={onLevelChange}
                                    />
                                </div>
                                <HallOfFame data={hallOfFame} />
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="journey">
                    {personalJourney && (
                        <div className="max-w-2xl mx-auto">
                            <PersonalJourneyCard journey={personalJourney} />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="stats">
                    <XPVisualizationsSection />
                </TabsContent>

                <TabsContent value="badges">
                    {userBadges && <BadgeShowcase badges={userBadges} />}
                </TabsContent>

                <TabsContent value="features">
                    {userFeatures && (
                        <div className="max-w-2xl mx-auto">
                            <UserFeaturesOverview features={userFeatures} />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}

function LevelNavigator({
    currentLevel,
    onLevelChange,
}: {
    currentLevel: number;
    onLevelChange: (level: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onLevelChange(currentLevel - 1)}
                disabled={currentLevel <= 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-50"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm">Level {currentLevel}</span>
            <button
                onClick={() => onLevelChange(currentLevel + 1)}
                disabled={currentLevel >= 10}
                className="p-1 rounded hover:bg-muted disabled:opacity-50"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}
