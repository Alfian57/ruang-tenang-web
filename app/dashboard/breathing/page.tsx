"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import {
    BreathingTechnique,
    BreathingSession,
    BreathingStats,
    RecommendationsResponse,
    SessionCompletionResult,
    DURATION_OPTIONS,
    MOOD_OPTIONS,
    BACKGROUND_SOUNDS,
    formatBreathingDuration,
    MoodId,
    BackgroundSoundId,
    BreathingCalendar,
    TechniqueUsageStats,
} from "@/types/breathing";
import {
    TechniqueGrid,
    SessionPlayer,
    StatsOverview,
    StreakBanner,
    CalendarHeatmap,
    TechniqueUsageChart,
} from "@/components/breathing";
import {
    Wind,
    Star,
    Settings2,
    ChevronLeft,
    Sparkles,
    History,
    BarChart3,
    X,
    Check,
    Volume2,
    Vibrate,
    Clock,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

type ViewMode = "techniques" | "session" | "history" | "stats";

export default function BreathingPage() {
    const router = useRouter();
    const { token } = useAuthStore();

    // URL state management
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const updateUrlParam = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // Read view from URL, default to "techniques"
    const urlView = searchParams.get("view") as ViewMode | null;
    const viewMode: ViewMode = urlView && ["techniques", "session", "history", "stats"].includes(urlView) ? urlView : "techniques";

    const setViewMode = (mode: ViewMode) => {
        updateUrlParam("view", mode === "techniques" ? null : mode);
    };

    // Main state
    const [isLoading, setIsLoading] = useState(true);

    // Data state
    const [techniques, setTechniques] = useState<BreathingTechnique[]>([]);
    const [favorites, setFavorites] = useState<BreathingTechnique[]>([]);
    const [stats, setStats] = useState<BreathingStats | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
    const [calendar, setCalendar] = useState<BreathingCalendar | null>(null);
    const [techniqueUsage, setTechniqueUsage] = useState<TechniqueUsageStats[]>([]);
    const [sessions, setSessions] = useState<BreathingSession[]>([]);
    const [sessionsTotal, setSessionsTotal] = useState(0);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Session state
    const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes default
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [completionResult, setCompletionResult] = useState<SessionCompletionResult | null>(null);

    // Settings
    const [moodBefore, setMoodBefore] = useState<MoodId | null>(null);
    const [moodAfter, setMoodAfter] = useState<MoodId | null>(null);
    const [voiceGuidance, setVoiceGuidance] = useState(false);
    const [hapticFeedback, setHapticFeedback] = useState(true);
    const [backgroundSound, setBackgroundSound] = useState<BackgroundSoundId>("none");

    // UI state
    const [showSettings, setShowSettings] = useState(false);
    const [showMoodSelector, setShowMoodSelector] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);

                const [techniquesRes, favoritesRes, statsRes, recommendationsRes] = await Promise.all([
                    api.getBreathingTechniques(token),
                    api.getBreathingFavorites(token),
                    api.getBreathingStats(token),
                    api.getBreathingRecommendations(token),
                ]);

                setTechniques(techniquesRes.data || []);
                setFavorites(favoritesRes.data || []);
                setStats(statsRes.data || null);
                setRecommendations(recommendationsRes.data || null);

                // Fetch calendar for current month
                const now = new Date();
                const calendarRes = await api.getBreathingCalendar(token, now.getFullYear(), now.getMonth() + 1);
                setCalendar(calendarRes.data || null);

                // Fetch technique usage
                const usageRes = await api.getBreathingTechniqueUsage(token);
                setTechniqueUsage(usageRes.data || []);
            } catch (error) {
                console.error("Failed to fetch breathing data:", error);
                toast.error("Gagal memuat data latihan pernapasan");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, router]);

    // Fetch session history when history view is active
    useEffect(() => {
        if (viewMode !== "history" || !token) return;

        const fetchHistory = async () => {
            try {
                setIsLoadingHistory(true);
                const res = await api.getBreathingSessions(token, { limit: 20 });
                setSessions(res.data?.sessions || []);
                setSessionsTotal(res.data?.total || 0);
            } catch (error) {
                console.error("Failed to fetch session history:", error);
                toast.error("Gagal memuat riwayat latihan");
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [viewMode, token]);

    // Handle technique selection
    const handleSelectTechnique = (technique: BreathingTechnique) => {
        setSelectedTechnique(technique);
        setShowMoodSelector(true);
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async (technique: BreathingTechnique) => {
        if (!token) return;

        try {
            if (technique.is_favorite) {
                await api.removeBreathingFavorite(token, technique.id);
                setFavorites(prev => prev.filter(f => f.id !== technique.id));
                setTechniques(prev => prev.map(t =>
                    t.id === technique.id ? { ...t, is_favorite: false } : t
                ));
                toast.success("Dihapus dari favorit");
            } else {
                await api.addBreathingFavorite(token, technique.id);
                setFavorites(prev => [...prev, { ...technique, is_favorite: true }]);
                setTechniques(prev => prev.map(t =>
                    t.id === technique.id ? { ...t, is_favorite: true } : t
                ));
                toast.success("Ditambahkan ke favorit");
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            toast.error("Gagal mengubah favorit");
        }
    };

    // Start session
    const handleStartSession = async () => {
        if (!token || !selectedTechnique) return;

        try {
            const res = await api.startBreathingSession(token, {
                technique_id: selectedTechnique.id,
                target_duration_seconds: selectedDuration,
                voice_guidance_enabled: voiceGuidance,
                background_sound: backgroundSound,
                haptic_feedback_enabled: hapticFeedback,
                mood_before: moodBefore || undefined,
            });

            setSessionId(res.data.id);
            setShowMoodSelector(false);
            setViewMode("session");
        } catch (error) {
            console.error("Failed to start session:", error);
            toast.error("Gagal memulai sesi");
        }
    };

    // Complete session
    const handleCompleteSession = async (data: {
        durationSeconds: number;
        cyclesCompleted: number;
        completed: boolean;
        completedPercentage: number;
    }) => {
        if (!token || !sessionId) return;

        try {
            const res = await api.completeBreathingSession(token, sessionId, {
                duration_seconds: data.durationSeconds,
                cycles_completed: data.cyclesCompleted,
                completed: data.completed,
                completed_percentage: data.completedPercentage,
                mood_after: moodAfter || undefined,
            });

            setCompletionResult(res.data);
            setShowCompletionModal(true);

            // Refresh stats
            const statsRes = await api.getBreathingStats(token);
            setStats(statsRes.data || null);
        } catch (error) {
            console.error("Failed to complete session:", error);
            toast.error("Gagal menyimpan sesi");
        }
    };

    // Reset session
    const handleExitSession = () => {
        setViewMode("techniques");
        setSelectedTechnique(null);
        setSessionId(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setCompletionResult(null);
        setShowCompletionModal(false);
    };

    // Group techniques
    const systemTechniques = techniques.filter(t => t.is_system);
    const customTechniques = techniques.filter(t => !t.is_system);

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
                        <h1 className="text-2xl font-bold">Latihan Pernapasan</h1>
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
                <div className="space-y-4">
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <Wind className="w-10 h-10 text-primary animate-pulse mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">Memuat riwayat...</p>
                            </div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <EmptyState
                            icon={<History className="w-8 h-8 text-muted-foreground" />}
                            title="Belum ada riwayat latihan"
                            description="Mulai sesi latihan pernapasan pertamamu dan riwayatnya akan muncul di sini."
                            action={{
                                label: "Mulai Latihan",
                                onClick: () => setViewMode("techniques"),
                            }}
                            className="py-16"
                        />
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {sessionsTotal} sesi tercatat
                            </p>
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                                style={{
                                                    backgroundColor: session.technique?.color ? `${session.technique.color}20` : "var(--muted)",
                                                    color: session.technique?.color || "var(--muted-foreground)",
                                                }}
                                            >
                                                💨
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">
                                                    {session.technique?.name || "Latihan Pernapasan"}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatBreathingDuration(session.duration_seconds)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(session.started_at).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {session.completed ? (
                                                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                                        Selesai
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                                                        {session.completed_percentage}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Techniques View */}
            {viewMode === "techniques" && (
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
                                    onClick={() => handleSelectTechnique(recommendations.default_pick!.technique)}
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
                                selectedId={selectedTechnique?.id}
                                onSelect={handleSelectTechnique}
                                onFavoriteToggle={handleFavoriteToggle}
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
                            selectedId={selectedTechnique?.id}
                            onSelect={handleSelectTechnique}
                            onFavoriteToggle={handleFavoriteToggle}
                            columns={2}
                        />
                    </div>

                    {/* Custom Techniques */}
                    {customTechniques.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Teknik Kustom</h2>
                            <TechniqueGrid
                                techniques={customTechniques}
                                selectedId={selectedTechnique?.id}
                                onSelect={handleSelectTechnique}
                                onFavoriteToggle={handleFavoriteToggle}
                                showActions
                                columns={2}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Mood Selector Modal */}
            {showMoodSelector && selectedTechnique && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Persiapan Sesi</h3>
                            <button
                                onClick={() => {
                                    setShowMoodSelector(false);
                                    setSelectedTechnique(null);
                                }}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Duration Selection */}
                        <div className="mb-6">
                            <label className="text-sm font-medium mb-2 block">Durasi Latihan</label>
                            <div className="grid grid-cols-3 gap-2">
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedDuration(option.value)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                            selectedDuration === option.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        {option.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mood Selection */}
                        <div className="mb-6">
                            <label className="text-sm font-medium mb-2 block">Bagaimana perasaanmu sekarang?</label>
                            <div className="flex flex-wrap gap-2">
                                {MOOD_OPTIONS.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setMoodBefore(mood.id as MoodId)}
                                        className={cn(
                                            "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
                                            moodBefore === mood.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <span>{mood.emoji}</span>
                                        <span>{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Session Settings */}
                        <div className="mb-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">Panduan suara</span>
                                </div>
                                <button
                                    onClick={() => setVoiceGuidance(!voiceGuidance)}
                                    className={cn(
                                        "w-10 h-6 rounded-full transition-colors relative",
                                        voiceGuidance ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                            voiceGuidance ? "translate-x-5" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Vibrate className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">Getaran</span>
                                </div>
                                <button
                                    onClick={() => setHapticFeedback(!hapticFeedback)}
                                    className={cn(
                                        "w-10 h-6 rounded-full transition-colors relative",
                                        hapticFeedback ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                            hapticFeedback ? "translate-x-5" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Background Sound */}
                        <div className="mb-6">
                            <label className="text-sm font-medium mb-2 block">Suara latar</label>
                            <div className="flex flex-wrap gap-2">
                                {BACKGROUND_SOUNDS.slice(0, 5).map((sound) => (
                                    <button
                                        key={sound.id}
                                        onClick={() => setBackgroundSound(sound.id as BackgroundSoundId)}
                                        className={cn(
                                            "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
                                            backgroundSound === sound.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <span>{sound.icon}</span>
                                        <span>{sound.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStartSession}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Mulai Latihan {formatBreathingDuration(selectedDuration)}
                        </button>
                    </div>
                </div>
            )}

            {/* Completion Modal */}
            {showCompletionModal && completionResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl w-full max-w-md p-6 text-center">
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                            completionResult.session.completed ? "bg-green-500/20" : "bg-amber-500/20"
                        )}>
                            <Check className={cn(
                                "w-10 h-10",
                                completionResult.session.completed ? "text-green-500" : "text-amber-500"
                            )} />
                        </div>

                        <h3 className="text-2xl font-bold mb-2">
                            {completionResult.session.completed ? "Sesi Selesai!" : "Sesi Belum Selesai"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Kamu telah berlatih selama {formatBreathingDuration(completionResult.session.duration_seconds)}
                        </p>

                        {/* Daily Task Completion - Only show if completed */}
                        {completionResult.session.completed ? (
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-2xl">✅</span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        Daily Task Selesai!
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Klaim poin di menu Daily Tasks
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-2xl">⚠️</span>
                                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                        Belum Memenuhi Target
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Selesaikan latihan hingga penuh untuk menyelesaikan daily task
                                </p>
                            </div>
                        )}

                        {/* Streak Info - Only show if completed */}
                        {completionResult.session.completed && (
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <div className="text-2xl">🔥</div>
                                <span className="text-lg font-semibold">{completionResult.new_streak} Hari Streak</span>
                            </div>
                        )}

                        {/* Mood After */}
                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">Bagaimana perasaanmu sekarang?</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {MOOD_OPTIONS.filter(m => ["calm", "happy", "energized", "focused", "neutral"].includes(m.id)).map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setMoodAfter(mood.id as MoodId)}
                                        className={cn(
                                            "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
                                            moodAfter === mood.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <span>{mood.emoji}</span>
                                        <span>{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleExitSession}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Pengaturan</h3>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Panduan Suara Default</p>
                                    <p className="text-sm text-muted-foreground">Aktifkan panduan suara secara default</p>
                                </div>
                                <button
                                    onClick={() => setVoiceGuidance(!voiceGuidance)}
                                    className={cn(
                                        "w-10 h-6 rounded-full transition-colors relative",
                                        voiceGuidance ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                            voiceGuidance ? "translate-x-5" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Getaran Default</p>
                                    <p className="text-sm text-muted-foreground">Aktifkan getaran secara default</p>
                                </div>
                                <button
                                    onClick={() => setHapticFeedback(!hapticFeedback)}
                                    className={cn(
                                        "w-10 h-6 rounded-full transition-colors relative",
                                        hapticFeedback ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                            hapticFeedback ? "translate-x-5" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>

                            <div>
                                <p className="font-medium mb-2">Durasi Default</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {DURATION_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedDuration(option.value)}
                                            className={cn(
                                                "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                                selectedDuration === option.value
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                        >
                                            {option.shortLabel}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
