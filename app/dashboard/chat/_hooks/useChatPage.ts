"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useJournalStore } from "@/store/journalStore";
import { moderationService } from "@/services/api";

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
    suggestedPrompts,
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

  const [newSessionDialog, setNewSessionDialog] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

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

  const handleLoadSession = (sessionId: string) => {
    if (token) loadSession(token, sessionId);
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
      setShowCrisisModal(true);
      return;
    }

    if (token) await sendTextMessage(token, content);
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    if (token) await sendAudioMessage(token, audioBlob);
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

    if (activeSession) {
      await sendTextMessage(token, prompt);
      return;
    }

    const sessionTitle = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;
    await createSession(token, sessionTitle);
    await sendTextMessage(token, prompt);
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
    currentSummary,
    isGeneratingSummary,
    suggestedPrompts,
    journalSettings,
    aiContext,
    setFilter,
    setActiveFolderId,
    handleLoadSession,
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
    handleSuggestedPrompt,
    handleAcceptDisclaimer,
  };
}
