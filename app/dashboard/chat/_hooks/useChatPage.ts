"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useJournalStore } from "@/store/journalStore";
import { moderationService, chatService } from "@/services/api";
import { ROUTES } from "@/lib/routes";
import { ChatContextPreferencesUpdate, ChatContextState, SendMessageOptions, SuggestedPrompt } from "@/types";

interface JourneyQuickPrompt {
  id: string;
  label: string;
  text: string;
}

interface ChatCreativeMode {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

interface ChatJourneyCompanion {
  sessionsThisWeek: number;
  previousSession: {
    uuid: string;
    title: string;
    lastMessage?: string;
    updatedAt: string;
  } | null;
  quickPrompts: JourneyQuickPrompt[];
  creativeModes: ChatCreativeMode[];
}

interface ChatReflectionNudge {
  key: string;
  checkpoint: number;
  userMessageCount: number;
  prompt: string;
}

const CRISIS_KEYWORDS = [
  "bunuh diri",
  "ingin mati",
  "akhiri hidup",
  "cutting",
  "silet tangan",
  "tidak kuat hidup",
  "mau mati",
  "gantung diri",
  "lukai diri",
];

const SITUATIONAL_STARTER_PROMPTS: SuggestedPrompt[] = [
  {
    id: "situational-1",
    text: "Aku lagi blank banget buat mulai tugas, bisa bantu aku bikin langkah 20 menit pertama?",
    category: "general",
  },
  {
    id: "situational-2",
    text: "Hari ini aku ngerasa capek mental. Tolong bantu aku pilih prioritas yang paling penting dulu.",
    category: "general",
  },
  {
    id: "situational-3",
    text: "Aku habis konflik sama teman kelompok dan kepikiran terus. Bisa bantu aku grounding dulu?",
    category: "general",
  },
  {
    id: "situational-4",
    text: "Aku sulit tidur karena overthinking. Tolong kasih rutinitas malam 10 menit yang realistis.",
    category: "general",
  },
  {
    id: "situational-5",
    text: "Besok presentasi dan aku cemas. Bantu aku latihan self-talk yang menenangkan dong.",
    category: "general",
  },
];

const REFLECTION_EVERY_N_USER_MESSAGES = 4;
const REFLECTION_DISMISSED_STORAGE_KEY = "chat_reflection_dismissed";

function truncateText(value: string, maxLength = 140): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

export function useChatPage() {
  const { user, token } = useAuthStore();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const {
    sessions,
    activeSession,
    messages,
    filter,
    isSending,
    isRecording,
    folders,
    activeFolderId,
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveSessionToFolder,
    setActiveFolderId,
    toggleMessagePin,
    exportChat,
    currentSummary,
    isGeneratingSummary,
    loadSummary,
    generateSummary,
    suggestedPrompts: apiSuggestedPrompts,
    loadSuggestedPrompts,
    loadSessions,
    loadSession,
    createSession,
    deleteSession,
    sendTextMessage,
    sendAudioMessage,
    toggleMessageLike,
    toggleFavorite,
    toggleTrash,
    setFilter,
    clearActiveSession,
  } = useChatStore();

  const suggestedPrompts = useMemo(() => {
    const merged = [...SITUATIONAL_STARTER_PROMPTS, ...apiSuggestedPrompts];
    const seen = new Set<string>();
    const deduped: SuggestedPrompt[] = [];

    for (const prompt of merged) {
      const normalizedText = prompt.text.trim().toLowerCase();
      if (!normalizedText || seen.has(normalizedText)) continue;

      seen.add(normalizedText);
      deduped.push(prompt);

      if (deduped.length >= 8) break;
    }

    return deduped;
  }, [apiSuggestedPrompts]);

  const journeyCompanion = useMemo<ChatJourneyCompanion>(() => {
    const nonTrashSessions = sessions
      .filter((session) => !session.is_trash)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const previousSession = activeSession
      ? nonTrashSessions.find((session) => session.uuid !== activeSession.uuid)
      : nonTrashSessions[0];

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const sessionsThisWeek = nonTrashSessions.filter(
      (session) => new Date(session.updated_at).getTime() >= weekAgo,
    ).length;

    const hour = new Date().getHours();
    const checkInLabel = hour < 12 ? "Check-in Pagi" : hour < 18 ? "Reset Sore" : "Tutup Hari";
    const checkInPrompt =
      hour < 12
        ? "Pagi ini aku ingin mulai dengan lebih tenang. Bantu aku bikin rencana 3 langkah kecil untuk hari ini."
        : hour < 18
          ? "Aku mau reset sebentar biar sisa hari ini lebih ringan. Bisa bantu grounding singkat + prioritas terakhir?"
          : "Sebelum tidur, bantu aku refleksi singkat: apa yang sudah berhasil, apa yang perlu dilepas, dan niat besok.";

    return {
      sessionsThisWeek,
      previousSession: previousSession
        ? {
          uuid: previousSession.uuid,
          title: previousSession.title,
          lastMessage: previousSession.last_message,
          updatedAt: previousSession.updated_at,
        }
        : null,
      quickPrompts: [
        {
          id: "journey-checkin",
          label: checkInLabel,
          text: checkInPrompt,
        },
        {
          id: "journey-grounding",
          label: "Grounding 2 Menit",
          text: "Aku lagi kewalahan. Tolong pimpin aku grounding 2 menit dengan langkah napas yang sederhana.",
        },
        {
          id: "journey-next-step",
          label: "Langkah Berikutnya",
          text: "Berdasarkan obrolan terakhirku, bantu aku pilih satu langkah paling realistis untuk 20 menit ke depan.",
        },
      ],
      creativeModes: [
        {
          id: "coach-lembut",
          label: "Coach Lembut",
          description: "Untuk menyusun langkah realistis tanpa tekanan.",
          prompt: "Gunakan mode coach lembut: bantu aku menentukan 1 target kecil hari ini, 1 hambatan terbesar, dan 1 langkah 10 menit yang paling mungkin kulakukan sekarang.",
        },
        {
          id: "refleksi-faktual",
          label: "Refleksi Faktual",
          description: "Pisahkan fakta, emosi, dan aksi berikutnya.",
          prompt: "Gunakan mode refleksi faktual: rangkum kondisiku dalam format Fakta -> Emosi -> Kebutuhan -> Aksi kecil, dengan bahasa singkat dan jelas.",
        },
        {
          id: "brainstorm-solusi",
          label: "Brainstorm Solusi",
          description: "Hasilkan opsi aman untuk kondisi yang sedang berat.",
          prompt: "Gunakan mode brainstorming solusi: berikan 3 opsi langkah kecil yang aman, urutkan dari paling ringan sampai paling menantang, lalu rekomendasikan opsi pertama.",
        },
      ],
    };
  }, [sessions, activeSession]);

  const [dismissedReflectionKeys, setDismissedReflectionKeys] = useState<string[]>([]);

  const [newSessionDialog, setNewSessionDialog] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [isSafeModeActive, setIsSafeModeActive] = useState(false);
  const [pendingCrisisMessage, setPendingCrisisMessage] = useState<string | null>(null);
  const [safeModeSessionId, setSafeModeSessionId] = useState<string | null>(null);
  const [chatContextState, setChatContextState] = useState<ChatContextState | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [isUpdatingContext, setIsUpdatingContext] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(REFLECTION_DISMISSED_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setDismissedReflectionKeys(parsed);
      }
    } catch (error) {
      console.error("Failed to restore reflection checkpoints:", error);
    }
  }, []);

  const persistDismissedReflectionKeys = useCallback((nextKeys: string[]) => {
    if (typeof window === "undefined") return;

    try {
      const trimmed = nextKeys.slice(-40);
      window.localStorage.setItem(REFLECTION_DISMISSED_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to persist reflection checkpoints:", error);
    }
  }, []);

  const markReflectionCheckpointHandled = useCallback((checkpointKey: string) => {
    setDismissedReflectionKeys((current) => {
      if (current.includes(checkpointKey)) return current;

      const next = [...current, checkpointKey].slice(-40);
      persistDismissedReflectionKeys(next);
      return next;
    });
  }, [persistDismissedReflectionKeys]);

  const reflectionNudge = useMemo<ChatReflectionNudge | null>(() => {
    if (!activeSession) return null;

    const userMessages = messages.filter((message) => message.role === "user");
    const userMessageCount = userMessages.length;

    if (userMessageCount < REFLECTION_EVERY_N_USER_MESSAGES) return null;
    if (userMessageCount % REFLECTION_EVERY_N_USER_MESSAGES !== 0) return null;

    const checkpoint = Math.floor(userMessageCount / REFLECTION_EVERY_N_USER_MESSAGES);
    const key = `${activeSession.uuid}:${checkpoint}`;
    if (dismissedReflectionKeys.includes(key)) return null;

    const recentContext = userMessages
      .slice(-3)
      .map((message, index) => `${index + 1}. ${truncateText(message.content)}`)
      .join("\n");

    const prompt = [
      "Bantu aku refleksi singkat dengan format berikut:",
      "1) Apa yang paling terasa dari obrolanku barusan.",
      "2) Satu kebutuhan utamaku saat ini.",
      "3) Satu langkah kecil yang realistis 10-20 menit ke depan.",
      "Gunakan bahasa hangat, to the point, dan tidak menghakimi.",
      recentContext ? `Konteks pesan terbaruku:\n${recentContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      key,
      checkpoint,
      userMessageCount,
      prompt,
    };
  }, [activeSession, messages, dismissedReflectionKeys]);

  useEffect(() => {
    if (!isSafeModeActive) return;
    if (!safeModeSessionId) return;

    const currentSessionId = activeSession?.uuid ?? null;
    if (currentSessionId && currentSessionId !== safeModeSessionId) {
      setIsSafeModeActive(false);
      setPendingCrisisMessage(null);
      setSafeModeSessionId(null);
    }
  }, [activeSession?.uuid, isSafeModeActive, safeModeSessionId]);

  useEffect(() => {
    if (user && user.has_accepted_ai_disclaimer === false) {
      setShowDisclaimer(true);
    }
  }, [user]);

  const handleAcceptDisclaimer = async () => {
    if (!token) return;
    try {
      await moderationService.acceptAIDisclaimer(token);
      setShowDisclaimer(false);
    } catch (error) {
      console.error("Failed to accept disclaimer:", error);
    }
  };

  const {
    settings: journalSettings,
    aiContext,
    loadSettings: loadJournalSettings,
    loadAIContext,
  } = useJournalStore();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (token) {
      loadSessions(token);
      loadFolders(token);
      loadJournalSettings(token);
      loadAIContext(token);
    }
  }, [token, loadSessions, loadFolders, loadJournalSettings, loadAIContext]);

  useEffect(() => {
    if (token) {
      loadSessions(token);
    }
  }, [token, filter, activeFolderId, loadSessions]);

  useEffect(() => {
    const urlView = searchParams.get("view");
    if (urlView && (urlView === "all" || urlView === "favorites" || urlView === "trash")) {
      if (urlView !== filter) setFilter(urlView as "all" | "favorites" | "trash");
    }
    const urlSession = searchParams.get("session");
    if (urlSession && token) {
      if (activeSession?.uuid !== urlSession) {
        loadSession(token, urlSession);
      }
    } else if (!urlSession && activeSession) {
      clearActiveSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, token]);

  useEffect(() => {
    if (filter !== "all") {
      updateUrlParam("view", filter);
    } else {
      updateUrlParam("view", null);
    }
  }, [filter, updateUrlParam]);

  useEffect(() => {
    if (activeSession?.uuid) {
      updateUrlParam("session", activeSession.uuid);
    } else {
      updateUrlParam("session", null);
    }
  }, [activeSession?.uuid, updateUrlParam]);

  useEffect(() => {
    if (token) {
      loadSuggestedPrompts(token);
    }
  }, [token, loadSuggestedPrompts]);

  useEffect(() => {
    if (token && activeSession?.uuid) {
      loadSummary(token, activeSession.uuid);
    }
  }, [token, activeSession?.uuid, loadSummary]);

  const loadChatContextState = useCallback(async (sessionId: string) => {
    if (!token) return;

    setIsContextLoading(true);
    try {
      const response = (await chatService.getContextState(token, sessionId)) as { data: ChatContextState };
      setChatContextState(response.data);
    } catch (error) {
      console.error("Failed to load chat context state:", error);
      setChatContextState(null);
    } finally {
      setIsContextLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !activeSession?.uuid) {
      setChatContextState(null);
      return;
    }

    void loadChatContextState(activeSession.uuid);
  }, [token, activeSession?.uuid, loadChatContextState]);

  const handleUpdateContextPreferences = useCallback(async (updates: ChatContextPreferencesUpdate) => {
    if (!token || !activeSession?.uuid) return;

    setIsUpdatingContext(true);
    try {
      const response = (await chatService.updateContextPreferences(token, activeSession.uuid, updates)) as {
        data: ChatContextState;
      };
      setChatContextState(response.data);
    } catch (error) {
      console.error("Failed to update context preferences:", error);
    } finally {
      setIsUpdatingContext(false);
    }
  }, [token, activeSession?.uuid]);

  const buildMessageOptions = useCallback((source: string): SendMessageOptions | undefined => {
    if (!chatContextState?.preferences) return undefined;

    const prefs = chatContextState.preferences;
    return {
      context: {
        enable_mood_context: prefs.enable_mood_context,
        enable_journal_context: prefs.enable_journal_context,
        enable_daily_task_context: prefs.enable_daily_task_context,
        enable_xp_level_context: prefs.enable_xp_level_context,
        enable_breathing_context: prefs.enable_breathing_context,
        enable_playlist_context: prefs.enable_playlist_context,
        enable_rewards_context: prefs.enable_rewards_context,
        enable_progress_map_context: prefs.enable_progress_map_context,
        enable_social_context: prefs.enable_social_context,
        session_intent: prefs.session_intent,
      },
      metadata: {
        source,
      },
    };
  }, [chatContextState?.preferences]);

  const handleLoadSession = (sessionId: string) => {
    if (token) loadSession(token, sessionId);
  };

  const handleResumeJourneySession = async (sessionId: string) => {
    if (!token) return;
    await loadSession(token, sessionId);
  };

  const handleCreateSession = async (title: string) => {
    if (token) {
      await createSession(token, title);
    }
  };

  const handleSendText = async (content: string) => {
    const lowerContent = content.toLowerCase();
    const hasCrisisKeyword = CRISIS_KEYWORDS.some(keyword => lowerContent.includes(keyword));

    if (hasCrisisKeyword) {
      setPendingCrisisMessage(content);
      setIsSafeModeActive(true);
      setSafeModeSessionId(activeSession?.uuid ?? null);
      return;
    }

    if (token) await sendTextMessage(token, content, buildMessageOptions("chat_input"));
  };

  const handleContinueInSafeMode = async () => {
    if (!token) return;

    const safePrompt = pendingCrisisMessage
      ? `Saya sedang merasa sangat berat. Tolong tanggapi dengan empati, langkah kecil yang aman, dan satu pertanyaan grounding. Pesan saya: ${pendingCrisisMessage}`
      : "Saya sedang merasa sangat berat. Tolong bantu saya menenangkan diri dengan langkah kecil yang aman.";

    await sendTextMessage(token, safePrompt, buildMessageOptions("safe_mode"));
    setIsSafeModeActive(false);
    setPendingCrisisMessage(null);
    setSafeModeSessionId(null);
  };

  const handleOpenCrisisSupport = () => {
    setShowCrisisModal(true);
  };

  const handleOpenBreathingSupport = () => {
    setIsSafeModeActive(false);
    setPendingCrisisMessage(null);
    setSafeModeSessionId(null);
    router.push(ROUTES.BREATHING);
  };

  const handleDismissSafeMode = () => {
    setIsSafeModeActive(false);
    setPendingCrisisMessage(null);
    setSafeModeSessionId(null);
  };

  const isSafeModeVisible = isSafeModeActive && (!safeModeSessionId || safeModeSessionId === activeSession?.uuid);

  const handleSendAudio = async (audioBlob: Blob) => {
    if (token) await sendAudioMessage(token, audioBlob, buildMessageOptions("voice_input"));
  };

  const handleToggleMessageLike = (messageId: number, isLike: boolean) => {
    if (token) toggleMessageLike(token, messageId, isLike);
  };

  const handleToggleFavorite = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (token) toggleFavorite(token, sessionId);
  };

  const handleToggleTrash = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (token) toggleTrash(token, sessionId);
  };

  const handleDeletePermanent = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeleteSessionId(sessionId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteSessionId || !token) return;
    setIsDeleting(true);
    try {
      await deleteSession(token, deleteSessionId);
      setShowDeleteModal(false);
      setDeleteSessionId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateFolder = async (name: string, color?: string) => {
    if (token) await createFolder(token, name, color);
  };

  const handleUpdateFolder = async (folderId: number, data: { name?: string; color?: string }) => {
    if (token) await updateFolder(token, folderId, data);
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (token) await deleteFolder(token, folderId);
  };

  const handleMoveToFolder = async (sessionId: string, folderId: number | null) => {
    if (token) await moveSessionToFolder(token, sessionId, folderId);
  };

  const handleTogglePin = async (messageId: number) => {
    if (token) await toggleMessagePin(token, messageId);
  };

  const handleExport = async (format: "pdf" | "txt") => {
    if (token && activeSession) {
      await exportChat(token, activeSession.uuid, format);
    }
  };

  const handleGenerateSummary = async () => {
    if (token && activeSession) {
      await generateSummary(token, activeSession.uuid);
    }
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    if (!token) return;
    if (isSafeModeVisible) return;

    if (activeSession) {
      await handleSendText(prompt);
      return;
    }

    const sessionTitle = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;
    await createSession(token, sessionTitle);
    await handleSendText(prompt);
  };

  const handleRunReflectionNudge = async () => {
    if (!token || !reflectionNudge) return;
    if (isSafeModeVisible) return;

    await sendTextMessage(token, reflectionNudge.prompt, buildMessageOptions("reflection_nudge"));
    markReflectionCheckpointHandled(reflectionNudge.key);
  };

  const handleGenerateReflectionSummary = async () => {
    if (!token || !activeSession || !reflectionNudge) return;
    if (isSafeModeVisible) return;

    await generateSummary(token, activeSession.uuid);
    await sendTextMessage(
      token,
      "Berdasarkan sesi ini, bantu aku membuat refleksi mingguan singkat berisi pola utama, pemicu, hal yang membantu, dan next action 1 langkah.",
      buildMessageOptions("reflection_summary"),
    );
    markReflectionCheckpointHandled(reflectionNudge.key);
  };

  const handleDismissReflectionNudge = () => {
    if (!reflectionNudge) return;
    markReflectionCheckpointHandled(reflectionNudge.key);
  };

  return {
    user,
    sessions,
    activeSession,
    messages,
    filter,
    isSending,
    isRecording,
    folders,
    activeFolderId,
    messagesEndRef,
    newSessionDialog,
    setNewSessionDialog,
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    showDisclaimer,
    showCrisisModal,
    setShowCrisisModal,
    isSafeModeActive: isSafeModeVisible,
    pendingCrisisMessage,
    currentSummary,
    isGeneratingSummary,
    suggestedPrompts,
    journeyCompanion,
    reflectionNudge,
    chatContextState,
    isContextLoading,
    isUpdatingContext,
    journalSettings,
    aiContext,
    setFilter,
    setActiveFolderId,
    handleLoadSession,
    handleResumeJourneySession,
    handleCreateSession,
    handleSendText,
    handleSendAudio,
    handleToggleMessageLike,
    handleTogglePin,
    handleToggleFavorite,
    handleToggleTrash,
    handleDeletePermanent,
    handleConfirmDelete,
    handleCreateFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    handleMoveToFolder,
    handleExport,
    handleGenerateSummary,
    handleUpdateContextPreferences,
    handleSuggestedPrompt,
    handleRunReflectionNudge,
    handleGenerateReflectionSummary,
    handleDismissReflectionNudge,
    handleAcceptDisclaimer,
    handleContinueInSafeMode,
    handleOpenCrisisSupport,
    handleOpenBreathingSupport,
    handleDismissSafeMode,
  };
}
