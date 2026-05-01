"use client";

import {
    BREATHING_INTENT_PRESETS,
    BreathingIntentPreset,
    BreathingStats,
    RecommendationsResponse,
    BreathingTechnique,
    formatBreathingDuration,
} from "@/types/breathing";
import { StreakBanner } from "./StreakBanner";
import { TechniqueGrid } from "./TechniqueGrid";
import { Moon, Sparkles, Star, Target, Zap } from "lucide-react";

interface TechniquesViewProps {
    stats: BreathingStats | null;
    recommendations: RecommendationsResponse | null;
    favorites: BreathingTechnique[];
    systemTechniques: BreathingTechnique[];
    customTechniques: BreathingTechnique[];
    selectedId?: string;
    onSelect: (technique: BreathingTechnique, preset?: BreathingIntentPreset) => void;
    onFavoriteToggle: (technique: BreathingTechnique) => void;
    onShowInfo?: (technique: BreathingTechnique) => void;
}

function uniqueTechniques(techniques: Array<BreathingTechnique | null | undefined>) {
    const seen = new Set<string>();
    return techniques.filter((technique): technique is BreathingTechnique => {
        if (!technique || seen.has(technique.id)) return false;
        seen.add(technique.id);
        return true;
    });
}

function findTechniqueForPreset(preset: BreathingIntentPreset, techniques: BreathingTechnique[]) {
    return (
        techniques.find((technique) => preset.preferredSlugs.includes(technique.slug)) ||
        techniques.find((technique) => technique.category === preset.preferredCategory) ||
        techniques[0]
    );
}

function PresetIcon({ id }: { id: BreathingIntentPreset["id"] }) {
    if (id === "sleep") return <Moon className="h-5 w-5" />;
    if (id === "energy") return <Zap className="h-5 w-5" />;
    if (id === "focus") return <Target className="h-5 w-5" />;
    return <Sparkles className="h-5 w-5" />;
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
    onShowInfo,
}: TechniquesViewProps) {
    const recommendationTechniques = uniqueTechniques([
        recommendations?.default_pick?.technique,
        ...(recommendations?.based_on_mood || []).map((item) => item.technique),
        ...(recommendations?.based_on_time || []).map((item) => item.technique),
        ...(recommendations?.based_on_activity || []).map((item) => item.technique),
    ]);
    const quickStartCandidates = uniqueTechniques([
        ...recommendationTechniques,
        ...favorites,
        ...systemTechniques,
        ...customTechniques,
    ]);
    const quickStarts = BREATHING_INTENT_PRESETS.map((preset) => ({
        preset,
        technique: findTechniqueForPreset(preset, quickStartCandidates),
    })).filter((item): item is { preset: BreathingIntentPreset; technique: BreathingTechnique } =>
        Boolean(item.technique)
    );

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

            {quickStarts.length > 0 && (
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Mulai Cepat</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {quickStarts.map(({ preset, technique }) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => onSelect(technique, preset)}
                                className="rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${technique.color}18`, color: technique.color }}
                                    >
                                        <PresetIcon id={preset.id} />
                                    </div>
                                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                        {formatBreathingDuration(preset.durationSeconds)}
                                    </span>
                                </div>
                                <h3 className="mt-3 font-semibold">{preset.label}</h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{preset.description}</p>
                                <p className="mt-3 text-xs font-medium text-foreground">{technique.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
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
                        onShowInfo={onShowInfo}
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
                        onShowInfo={onShowInfo}
                        showActions
                        columns={2}
                    />
                </div>
            )}
        </div>
    );
}
