"use client";

import { motion } from "framer-motion";
import type { FullMapResponse, MapRegion } from "@/types/progress-map";
import { Lock, Sparkles } from "lucide-react";

// Theme colors for each region based on display order
const REGION_THEMES = [
    { bg: "from-emerald-400 to-emerald-600", glow: "shadow-emerald-400/40", ring: "ring-emerald-400" },
    { bg: "from-sky-400 to-sky-600", glow: "shadow-sky-400/40", ring: "ring-sky-400" },
    { bg: "from-violet-400 to-violet-600", glow: "shadow-violet-400/40", ring: "ring-violet-400" },
    { bg: "from-amber-400 to-amber-600", glow: "shadow-amber-400/40", ring: "ring-amber-400" },
    { bg: "from-rose-400 to-rose-600", glow: "shadow-rose-400/40", ring: "ring-rose-400" },
    { bg: "from-teal-400 to-teal-600", glow: "shadow-teal-400/40", ring: "ring-teal-400" },
    { bg: "from-indigo-400 to-indigo-600", glow: "shadow-indigo-400/40", ring: "ring-indigo-400" },
    { bg: "from-pink-400 to-pink-600", glow: "shadow-pink-400/40", ring: "ring-pink-400" },
    { bg: "from-cyan-400 to-cyan-600", glow: "shadow-cyan-400/40", ring: "ring-cyan-400" },
    { bg: "from-yellow-400 to-yellow-500", glow: "shadow-yellow-400/40", ring: "ring-yellow-400" },
];

interface WorldMapProps {
    mapData: FullMapResponse;
    onSelectRegion: (region: MapRegion) => void;
}

export function WorldMap({ mapData, onSelectRegion }: WorldMapProps) {
    const sortedRegions = [...mapData.regions].sort(
        (a, b) => a.display_order - b.display_order
    );

    return (
        <div className="relative w-full">
            {/* Map container with path */}
            <div className="relative mx-auto max-w-4xl py-8">
                {/* Connecting path line */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Region nodes */}
                <div className="relative flex flex-col gap-6 md:gap-8">
                    {sortedRegions.map((region, index) => {
                        const theme = REGION_THEMES[index % REGION_THEMES.length];
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={region.id}
                                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08, duration: 0.4 }}
                                className={`flex items-center gap-4 md:gap-6 ${isEven ? "flex-row" : "flex-row-reverse"
                                    }`}
                            >
                                {/* Node */}
                                <button
                                    onClick={() => onSelectRegion(region)}
                                    disabled={!region.is_unlocked}
                                    className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer
                    ${region.is_unlocked
                                            ? `bg-linear-to-br ${theme.bg} text-white shadow-lg ${theme.glow} hover:scale-110 hover:shadow-xl active:scale-105`
                                            : "bg-gray-300 text-white cursor-not-allowed"
                                        }
                  `}
                                >
                                    {region.image && (
                                        <div
                                            className={`absolute inset-0 rounded-2xl bg-cover bg-center ${region.is_unlocked ? "opacity-40" : "opacity-80 grayscale"}`}
                                            style={{ backgroundImage: `url(${region.image})` }}
                                            aria-hidden="true"
                                        />
                                    )}

                                    {region.is_unlocked ? (
                                        <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/20 to-transparent" aria-hidden="true" />
                                    ) : (
                                        <div className="absolute inset-0 rounded-2xl bg-black/35" aria-hidden="true" />
                                    )}

                                    {region.is_unlocked ? (
                                        <>
                                            <span className="relative z-10 text-3xl md:text-4xl">{region.icon || "🏝️"}</span>
                                            {/* Landmark progress badge */}
                                            {region.total_landmarks > 0 && (
                                                <span className="absolute z-10 -bottom-1 -right-1 bg-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow text-gray-700">
                                                    {region.unlocked_landmarks}/{region.total_landmarks}
                                                </span>
                                            )}
                                            {/* Sparkle for fully completed */}
                                            {region.unlocked_landmarks === region.total_landmarks &&
                                                region.total_landmarks > 0 && (
                                                    <Sparkles className="absolute z-10 -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                                                )}
                                        </>
                                    ) : (
                                        <div className="relative z-10 flex flex-col items-center gap-1">
                                            <Lock className="h-6 w-6 md:h-8 md:w-8" />
                                            <span className="text-[10px] md:text-xs font-semibold px-1.5 py-0.5 rounded-full bg-black/35">
                                                Lv. {region.unlock_value}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                {/* Info card */}
                                <button
                                    onClick={() => region.is_unlocked && onSelectRegion(region)}
                                    disabled={!region.is_unlocked}
                                    className={`flex-1 text-left rounded-xl border p-3 md:p-4 transition-all duration-200
                    ${region.is_unlocked
                                            ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer"
                                            : "bg-gray-50 border-gray-100 cursor-not-allowed"
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3
                                            className={`font-semibold text-sm md:text-base ${region.is_unlocked ? "text-gray-900" : "text-gray-400"
                                                }`}
                                        >
                                            {region.name}
                                        </h3>
                                        {!region.is_unlocked && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                Lv. {region.unlock_value}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs md:text-sm line-clamp-2 ${region.is_unlocked ? "text-gray-500" : "text-gray-300"
                                            }`}
                                    >
                                        {region.is_unlocked
                                            ? region.description
                                            : `Buka kunci di Level ${region.unlock_value}`}
                                    </p>
                                    {region.is_unlocked && region.total_landmarks > 0 && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                                <span>Landmark</span>
                                                <span>
                                                    {region.unlocked_landmarks}/{region.total_landmarks}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full bg-linear-to-r ${theme.bg}`}
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${(region.unlocked_landmarks / region.total_landmarks) * 100
                                                            }%`,
                                                    }}
                                                    transition={{ delay: index * 0.08 + 0.3, duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
