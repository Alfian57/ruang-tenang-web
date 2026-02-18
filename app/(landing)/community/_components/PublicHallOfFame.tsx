"use client";

import { motion } from "framer-motion";
import { HallOfFame } from "@/components/shared/gamification";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import type { LevelHallOfFameResponse } from "@/types";

interface PublicHallOfFameProps {
    hallOfFame: LevelHallOfFameResponse;
    currentLevel: number;
    onLevelChange: (level: number) => void;
}

export function PublicHallOfFame({
    hallOfFame,
    currentLevel,
    onLevelChange,
}: PublicHallOfFameProps) {
    return (
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
            </div>
            <div className="max-w-xl">
                <HallOfFame data={hallOfFame} />
            </div>
        </motion.div>
    );
}
