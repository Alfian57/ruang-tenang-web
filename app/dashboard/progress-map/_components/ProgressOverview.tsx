"use client";

import { motion } from "framer-motion";
import type { FullMapResponse } from "@/types/progress-map";
import { Map, Compass, Flag, Sparkles } from "lucide-react";

interface ProgressOverviewProps {
    mapData: FullMapResponse;
}

export function ProgressOverview({ mapData }: ProgressOverviewProps) {
    const stats = [
        {
            icon: Map,
            label: "Area Terbuka",
            value: `${mapData.unlocked_regions}/${mapData.total_regions}`,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            icon: Flag,
            label: "Landmark",
            value: `${mapData.unlocked_landmarks}/${mapData.total_landmarks}`,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            icon: Compass,
            label: "Progress",
            value: `${Math.round(mapData.overall_progress)}%`,
            color: "text-sky-600",
            bg: "bg-sky-50",
        },
    ];

    return (
        <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-xl border p-3 text-center"
                    >
                        <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Overall progress bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border p-4"
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-gray-700">
                            Perjalanan Keseluruhan
                        </span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                        {Math.round(mapData.overall_progress)}%
                    </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${mapData.overall_progress}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
