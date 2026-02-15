"use client";

import {
    SessionPlayer,
    StatsOverview,
    CalendarHeatmap,
    TechniqueUsageChart,
    TechniquesView,
    HistoryView,
    MoodSelectorModal,
    CompletionModal,
    SettingsModal,
} from "./_components";
import {
    ChevronLeft,
    History,
    BarChart3,
    Settings2,
    Wind,
} from "lucide-react";
import { useBreathing } from "./_hooks/useBreathing";

export default function BreathingPage() {
    const {
        viewMode,
        setViewMode,
        isLoading,
        favorites,
        stats,
        recommendations,
        calendar,
        techniqueUsage,
        sessions,
        sessionsTotal,
        isLoadingHistory,
        systemTechniques,
        customTechniques,
        selectedTechnique,
        selectedDuration,
        setSelectedDuration,
        completionResult,
        moodBefore,
        setMoodBefore,
        moodAfter,
        setMoodAfter,
        voiceGuidance,
        setVoiceGuidance,
        hapticFeedback,
        setHapticFeedback,
        backgroundSound,
        setBackgroundSound,
        showSettings,
        setShowSettings,
        showMoodSelector,
        setShowMoodSelector,
        showCompletionModal,
        handleSelectTechnique,
        handleFavoriteToggle,
        handleStartSession,
        handleCompleteSession,
        handleExitSession,
    } = useBreathing();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <Wind className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-muted-foreground">Memuat latihan pernapasan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {viewMode !== "techniques" && (
                        <button
                            onClick={handleExitSession}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">Pernafasan</h1>
                        <p className="text-muted-foreground">
                            {viewMode === "techniques" && "Pilih teknik untuk memulai"}
                            {viewMode === "session" && selectedTechnique?.name}
                            {viewMode === "history" && "Riwayat latihan"}
                            {viewMode === "stats" && "Statistik latihan"}
                        </p>
                    </div>
                </div>

                {viewMode === "techniques" && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode("history")}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            title="Riwayat"
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("stats")}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            title="Statistik"
                        >
                            <BarChart3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            title="Pengaturan"
                        >
                            <Settings2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Session View */}
            {viewMode === "session" && selectedTechnique && (
                <SessionPlayer
                    technique={selectedTechnique}
                    targetDurationSeconds={selectedDuration}
                    voiceGuidance={voiceGuidance}
                    hapticFeedback={hapticFeedback}
                    backgroundSound={backgroundSound}
                    onComplete={handleCompleteSession}
                    onExit={handleExitSession}
                />
            )}

            {/* Stats View */}
            {viewMode === "stats" && stats && (
                <div className="space-y-6">
                    <StatsOverview stats={stats} />

                    <div className="grid md:grid-cols-2 gap-6">
                        {calendar && (
                            <CalendarHeatmap
                                days={calendar.days}
                                month={calendar.month}
                                year={calendar.year}
                            />
                        )}
                        <TechniqueUsageChart usage={techniqueUsage} />
                    </div>
                </div>
            )}

            {/* History View */}
            {viewMode === "history" && (
                <HistoryView
                    isLoading={isLoadingHistory}
                    sessions={sessions}
                    sessionsTotal={sessionsTotal}
                    onStart={() => setViewMode("techniques")}
                />
            )}

            {/* Techniques View */}
            {viewMode === "techniques" && (
                <TechniquesView
                    stats={stats}
                    recommendations={recommendations}
                    favorites={favorites}
                    systemTechniques={systemTechniques}
                    customTechniques={customTechniques}
                    selectedId={selectedTechnique?.id}
                    onSelect={handleSelectTechnique}
                    onFavoriteToggle={handleFavoriteToggle}
                />
            )}

            {/* Modals */}
            <MoodSelectorModal
                isOpen={showMoodSelector}
                onClose={() => setShowMoodSelector(false)}
                selectedTechnique={selectedTechnique}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                moodBefore={moodBefore}
                setMoodBefore={setMoodBefore}
                voiceGuidance={voiceGuidance}
                setVoiceGuidance={setVoiceGuidance}
                hapticFeedback={hapticFeedback}
                setHapticFeedback={setHapticFeedback}
                backgroundSound={backgroundSound}
                setBackgroundSound={setBackgroundSound}
                onStart={handleStartSession}
            />

            <CompletionModal
                isOpen={showCompletionModal}
                result={completionResult}
                moodAfter={moodAfter}
                setMoodAfter={setMoodAfter}
                onExit={handleExitSession}
            />

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                voiceGuidance={voiceGuidance}
                setVoiceGuidance={setVoiceGuidance}
                hapticFeedback={hapticFeedback}
                setHapticFeedback={setHapticFeedback}
            />
        </div>
    );
}
