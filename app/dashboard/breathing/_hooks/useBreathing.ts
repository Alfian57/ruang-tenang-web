"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { breathingService } from "@/services/api";
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
} from "@/types/breathing";
import { toast } from "sonner";

export type ViewMode = "techniques" | "session" | "history" | "stats" | "faq";

const BREATHING_TUTORIAL_SEEN_KEY = "rt_breathing_tutorial_seen";

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
    const viewMode: ViewMode = urlView && ["techniques", "session", "history", "stats", "faq"].includes(urlView) ? urlView : "techniques";

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
    const handleSelectTechnique = (technique: BreathingTechnique) => {
        setSelectedTechnique(technique);
        setShowMoodSelector(true);
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
            const res = await breathingService.startSession(token, {
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
            const res = await breathingService.completeSession(token, sessionId, {
                duration_seconds: data.durationSeconds,
                cycles_completed: data.cyclesCompleted,
                completed: data.completed,
                completed_percentage: data.completedPercentage,
                mood_after: moodAfter || undefined,
            });

            setCompletionResult(res.data);
            setShowCompletionModal(true);

            // Refresh stats
            const statsRes = await breathingService.getStats(token);
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
        selectedDuration,
        setSelectedDuration,
        completionResult,

        // Settings
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
        handleFavoriteToggle,
        handleStartSession,
        handleCompleteSession,
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
