"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { breathingService } from "@/services/api";
import { songService } from "@/services/api/song";
import { useAuthStore } from "@/store/authStore";
import {
    BreathingTechnique,
    BreathingSession,
    BreathingStats,
    RecommendationsResponse,
    SessionCompletionResult,
    MoodId,
    BackgroundSoundId,
    BreathingCalendar,
    TechniqueUsageStats,
    BreathingPreferences,
    BreathingIntentPreset,
    BreathingSessionDraft,
} from "@/types/breathing";
import type { Song } from "@/types";
import { toast } from "sonner";

export type ViewMode = "techniques" | "session" | "history" | "stats" | "faq";

const BREATHING_TUTORIAL_SEEN_KEY = "rt_breathing_tutorial_seen";

type SelectTechniqueOptions = Partial<
    Pick<BreathingIntentPreset, "id" | "durationSeconds" | "moodBefore" | "backgroundSound">
>;

export function useBreathing() {
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
    const initialViewMode: ViewMode =
        urlView && ["techniques", "session", "history", "stats", "faq"].includes(urlView)
            ? urlView
            : "techniques";
    const [viewMode, setViewModeState] = useState<ViewMode>(initialViewMode);

    useEffect(() => {
        const nextView: ViewMode =
            urlView && ["techniques", "session", "history", "stats", "faq"].includes(urlView)
                ? urlView
                : "techniques";

        // Do not override active session state from URL changes.
        if (viewMode !== "session") {
            setViewModeState(nextView);
        }
    }, [urlView, viewMode]);

    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);

        // Session is transient state; avoid route navigation to reduce SW no-response issues.
        if (mode === "session") {
            return;
        }

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
    const [pendingCompletion, setPendingCompletion] = useState<BreathingSessionDraft | null>(null);
    const [isSavingCompletion, setIsSavingCompletion] = useState(false);
    const [sessionSong, setSessionSong] = useState<Song | null>(null);

    // Settings
    const [moodBefore, setMoodBefore] = useState<MoodId | null>(null);
    const [moodAfter, setMoodAfter] = useState<MoodId | null>(null);
    const [selectedIntentId, setSelectedIntentId] = useState<BreathingIntentPreset["id"] | null>(null);
    const [voiceGuidance, setVoiceGuidance] = useState(false);
    const [hapticFeedback, setHapticFeedback] = useState(true);
    const [backgroundSound, setBackgroundSound] = useState<BackgroundSoundId>("none");

    // UI state
    const [showSettings, setShowSettings] = useState(false);
    const [showMoodSelector, setShowMoodSelector] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoTechnique, setInfoTechnique] = useState<BreathingTechnique | null>(null);

    // Preferences state
    const [preferences, setPreferences] = useState<BreathingPreferences | null>(null);

    // Fetch initial data
    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const hasSeenTutorial = localStorage.getItem(BREATHING_TUTORIAL_SEEN_KEY) === "1";
                let shouldShowTutorial = !hasSeenTutorial;

                const [techniquesRes, favoritesRes, statsRes, recommendationsRes] = await Promise.allSettled([
                    breathingService.getTechniques(token),
                    breathingService.getFavorites(token),
                    breathingService.getStats(token),
                    breathingService.getRecommendations(token),
                ]);

                setTechniques(techniquesRes.status === "fulfilled" ? techniquesRes.value.data || [] : []);
                setFavorites(favoritesRes.status === "fulfilled" ? favoritesRes.value.data || [] : []);
                setStats(statsRes.status === "fulfilled" ? statsRes.value.data || null : null);
                setRecommendations(recommendationsRes.status === "fulfilled" ? recommendationsRes.value.data || null : null);

                // Fetch calendar for current month
                try {
                    const now = new Date();
                    const calendarRes = await breathingService.getCalendar(token, now.getFullYear(), now.getMonth() + 1);
                    setCalendar(calendarRes.data || null);
                } catch {
                    setCalendar(null);
                }

                // Fetch technique usage
                try {
                    const usageRes = await breathingService.getTechniqueUsage(token);
                    setTechniqueUsage(usageRes.data || []);
                } catch {
                    setTechniqueUsage([]);
                }

                // Fetch preferences for tutorial/reminder state
                try {
                    const prefsRes = await breathingService.getPreferences(token);
                    if (prefsRes.data) {
                        setPreferences(prefsRes.data);
                        if (prefsRes.data.tutorial_completed) {
                            shouldShowTutorial = false;
                        }
                        if (!prefsRes.data.tutorial_completed && !hasSeenTutorial) {
                            shouldShowTutorial = true;
                        }
                    }
                } catch {
                    // Preferences fetch is non-critical
                }

                if (shouldShowTutorial) {
                    localStorage.setItem(BREATHING_TUTORIAL_SEEN_KEY, "1");
                    setShowTutorial(true);
                }
            } catch (error) {
                console.error("Failed to fetch breathing data:", error);
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
                const res = await breathingService.getSessions(token, { limit: 20 });
                if (res.data) {
                    setSessions(res.data.sessions || []);
                    setSessionsTotal(res.data.total || 0);
                }
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
    const handleSelectTechnique = (technique: BreathingTechnique, options?: SelectTechniqueOptions) => {
        setSelectedTechnique(technique);
        setSelectedIntentId(options?.id || null);
        setMoodBefore(options?.moodBefore || null);
        setMoodAfter(null);
        setCompletionResult(null);
        setPendingCompletion(null);

        if (options?.durationSeconds) {
            setSelectedDuration(options.durationSeconds);
        }

        if (options?.backgroundSound) {
            setBackgroundSound(options.backgroundSound);
        }

        setShowMoodSelector(true);
    };

    const handleApplyIntent = (preset: BreathingIntentPreset) => {
        setSelectedIntentId(preset.id);
        setSelectedDuration(preset.durationSeconds);
        setMoodBefore(preset.moodBefore);
        setBackgroundSound(preset.backgroundSound);
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async (technique: BreathingTechnique) => {
        if (!token) return;

        try {
            if (technique.is_favorite) {
                await breathingService.removeFavorite(token, technique.id);
                setFavorites(prev => prev.filter(f => f.id !== technique.id));
                setTechniques(prev => prev.map(t =>
                    t.id === technique.id ? { ...t, is_favorite: false } : t
                ));
                toast.success("Dihapus dari favorit");
            } else {
                await breathingService.addFavorite(token, technique.id);
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
            setCompletionResult(null);
            setPendingCompletion(null);
            setMoodAfter(null);

            let randomSong: Song | null = null;

            if (backgroundSound !== "none") {
                try {
                    const categoriesRes = await songService.getCategories();
                    const categories = categoriesRes.data || [];

                    if (categories.length > 0) {
                        const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);

                        for (const category of shuffledCategories) {
                            const songsRes = await songService.getSongsByCategory(category.slug || category.id);
                            const songs = songsRes.data || [];
                            if (songs.length > 0) {
                                randomSong = songs[Math.floor(Math.random() * songs.length)];
                                break;
                            }
                        }
                    }
                } catch (songError) {
                    console.error("Failed to fetch random breathing song:", songError);
                }
            }

            const res = await breathingService.startSession(token, {
                technique_id: selectedTechnique.id,
                target_duration_seconds: selectedDuration,
                voice_guidance_enabled: voiceGuidance,
                background_sound: backgroundSound,
                haptic_feedback_enabled: hapticFeedback,
                mood_before: moodBefore || undefined,
            });

            setSessionId(res.data.id);
            setSessionSong(randomSong);
            setShowMoodSelector(false);
            setViewMode("session");
        } catch (error) {
            console.error("Failed to start session:", error);
            toast.error("Gagal memulai sesi");
        }
    };

    // Open the reflection step before saving the completed session.
    const handleCompleteSession = (data: BreathingSessionDraft) => {
        if (!sessionId) {
            toast.error("Sesi belum siap untuk disimpan");
            return;
        }

        setPendingCompletion(data);
        setCompletionResult(null);
        setShowCompletionModal(true);
    };

    const handleSubmitCompletion = async () => {
        if (!token || !sessionId || !pendingCompletion) return;

        try {
            setIsSavingCompletion(true);
            const res = await breathingService.completeSession(token, sessionId, {
                duration_seconds: pendingCompletion.durationSeconds,
                cycles_completed: pendingCompletion.cyclesCompleted,
                completed: pendingCompletion.completed,
                completed_percentage: pendingCompletion.completedPercentage,
                mood_after: moodAfter || undefined,
            });

            setCompletionResult(res.data);

            // Refresh stats
            const statsRes = await breathingService.getStats(token);
            setStats(statsRes.data || null);
        } catch (error) {
            console.error("Failed to complete session:", error);
            toast.error("Gagal menyimpan sesi");
        } finally {
            setIsSavingCompletion(false);
        }
    };

    // Reset session
    const handleExitSession = () => {
        setViewMode("techniques");
        setSelectedTechnique(null);
        setSessionId(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setSelectedIntentId(null);
        setCompletionResult(null);
        setPendingCompletion(null);
        setIsSavingCompletion(false);
        setSessionSong(null);
        setShowCompletionModal(false);
    };

    const handleRepeatSession = () => {
        if (!selectedTechnique) {
            handleExitSession();
            return;
        }

        setViewMode("techniques");
        setSessionId(null);
        setMoodAfter(null);
        setCompletionResult(null);
        setPendingCompletion(null);
        setIsSavingCompletion(false);
        setSessionSong(null);
        setShowCompletionModal(false);
        setShowMoodSelector(true);
    };

    // Group techniques
    const systemTechniques = techniques.filter(t => t.is_system);
    const customTechniques = techniques.filter(t => !t.is_system);

    // Tutorial completion
    const handleTutorialComplete = async () => {
        setShowTutorial(false);
        localStorage.setItem(BREATHING_TUTORIAL_SEEN_KEY, "1");
        if (token) {
            try {
                await breathingService.updatePreferences(token, { tutorial_completed: true });
            } catch {
                // Non-critical
            }
        }
    };

    // Show technique info
    const handleShowInfo = (technique: BreathingTechnique) => {
        setInfoTechnique(technique);
        setShowInfoModal(true);
    };

    const handleCloseInfo = () => {
        setShowInfoModal(false);
        setInfoTechnique(null);
    };

    const handleStartFromInfo = () => {
        if (infoTechnique) {
            handleCloseInfo();
            handleSelectTechnique(infoTechnique);
        }
    };

    // Replay tutorial
    const handleReplayTutorial = () => {
        localStorage.setItem(BREATHING_TUTORIAL_SEEN_KEY, "1");
        setShowTutorial(true);
    };

    // Reminder settings
    const handleReminderToggle = async (enabled: boolean) => {
        if (!token) return;
        setPreferences(prev => prev ? { ...prev, reminder_enabled: enabled } : prev);
        try {
            await breathingService.updatePreferences(token, { reminder_enabled: enabled });
        } catch {
            toast.error("Gagal menyimpan pengingat");
        }
    };

    const handleReminderTimeChange = async (time: string) => {
        if (!token) return;
        setPreferences(prev => prev ? { ...prev, reminder_time: time } : prev);
        try {
            await breathingService.updatePreferences(token, { reminder_time: time });
        } catch {
            toast.error("Gagal menyimpan waktu pengingat");
        }
    };

    const handleReminderDaysChange = async (days: string) => {
        if (!token) return;
        setPreferences(prev => prev ? { ...prev, reminder_days: days } : prev);
        try {
            await breathingService.updatePreferences(token, { reminder_days: days });
        } catch {
            toast.error("Gagal menyimpan hari pengingat");
        }
    };

    return {
        // View
        viewMode,
        setViewMode,
        isLoading,

        // Data
        techniques,
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

        // Session
        selectedTechnique,
        sessionSong,
        selectedDuration,
        setSelectedDuration,
        completionResult,
        pendingCompletion,
        isSavingCompletion,

        // Settings
        moodBefore,
        setMoodBefore,
        moodAfter,
        setMoodAfter,
        selectedIntentId,
        voiceGuidance,
        setVoiceGuidance,
        hapticFeedback,
        setHapticFeedback,
        backgroundSound,
        setBackgroundSound,

        // UI
        showSettings,
        setShowSettings,
        showMoodSelector,
        setShowMoodSelector,
        showCompletionModal,
        showTutorial,
        showInfoModal,
        infoTechnique,
        preferences,

        // Handlers
        handleSelectTechnique,
        handleApplyIntent,
        handleFavoriteToggle,
        handleStartSession,
        handleCompleteSession,
        handleSubmitCompletion,
        handleRepeatSession,
        handleExitSession,
        handleTutorialComplete,
        handleShowInfo,
        handleCloseInfo,
        handleStartFromInfo,
        handleReplayTutorial,
        handleReminderToggle,
        handleReminderTimeChange,
        handleReminderDaysChange,
    };
}
