"use client";

import { BreathingStats, RecommendationsResponse, BreathingTechnique } from "@/types/breathing";
import { StreakBanner } from "./BreathingStats";
import { TechniqueGrid } from "./TechniqueCard";
import { Sparkles, Star } from "lucide-react";

interface TechniquesViewProps {
    stats: BreathingStats | null;
    recommendations: RecommendationsResponse | null;
    favorites: BreathingTechnique[];
    systemTechniques: BreathingTechnique[];
    customTechniques: BreathingTechnique[];
    selectedId?: string;
    onSelect: (technique: BreathingTechnique) => void;
    onFavoriteToggle: (technique: BreathingTechnique) => void;
}

export function TechniquesView({
    stats,
    recommendations,
    favorites,
    systemTechniques,
    customTechniques,
    selectedId,
    onSelect,
    onFavoriteToggle,
}: TechniquesViewProps) {
    return (
        <div className="space-y-8">
            {/* Streak Banner */}
            {stats && (
                <StreakBanner
                    currentStreak={stats.streak_info.current_streak}
                    streakAtRisk={stats.streak_info.days_until_streak_break === 0}
                    needsPractice={stats.today.sessions_count === 0}
                />
            )}

            {/* Recommendations */}
            {recommendations?.default_pick && (
                <div className="p-4 rounded-xl bg-linear-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold">Rekomendasi untuk Kamu</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                            style={{
                                backgroundColor: `${recommendations.default_pick.technique.color}20`,
                                color: recommendations.default_pick.technique.color
                            }}
                        >
                            💨
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium">{recommendations.default_pick.technique.name}</h3>
                            <p className="text-sm text-muted-foreground">{recommendations.default_pick.reason}</p>
                        </div>
                        <button
                            onClick={() => onSelect(recommendations.default_pick!.technique)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Mulai
                        </button>
                    </div>
                </div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Favorit</h2>
                    </div>
                    <TechniqueGrid
                        techniques={favorites}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onFavoriteToggle={onFavoriteToggle}
                        compact
                        columns={3}
                    />
                </div>
            )}

            {/* System Techniques */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Teknik Pernapasan</h2>
                <TechniqueGrid
                        techniques={systemTechniques}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onFavoriteToggle={onFavoriteToggle}
                        columns={2}
                    />
            </div>

            {/* Custom Techniques */}
            {customTechniques.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-4">Teknik Kustom</h2>
                    <TechniqueGrid
                        techniques={customTechniques}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onFavoriteToggle={onFavoriteToggle}
                        showActions
                        columns={2}
                    />
                </div>
            )}
        </div>
    );
}
