"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useJournalStore } from "@/stores/journalStore";
import {
  ChatSidebar,
  NewSessionDialog,
  ChatMessagesArea,
} from "@/components/dashboard/chat";
import { AIDisclaimerModal } from "@/components/ui/ai-disclaimer-modal";
import { CrisisSupportModal } from "@/components/moderation";
import { api } from "@/lib/api";

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

/**
 * Chat page component for AI-powered mental health conversations.
 * Allows users to create sessions, send text/voice messages, and manage chat history.
 */
export default function ChatPage() {
  const { user, token } = useAuthStore();

  // Zustand store state and actions
  const {
    sessions,
    activeSession,
    messages,
    filter,
    isSending,
    isRecording,
    // Folders
    folders,
    activeFolderId,
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveSessionToFolder,
    setActiveFolderId,
    // Pin messages
    toggleMessagePin,
    // Export & Summary
    exportChat,
    currentSummary,
    isGeneratingSummary,
    loadSummary,
    generateSummary,
    // Suggested prompts
    suggestedPrompts,
    loadSuggestedPrompts,
    // Core actions
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
  } = useChatStore();

  // Local UI state for dialogs
  const [newSessionDialog, setNewSessionDialog] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);
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
    if(!token) return;
    try {
        await api.acceptAIDisclaimer(token);
        setShowDisclaimer(false);
        // Optimistically update user in store if possible, or reload user
        // useAuthStore.setState({ user: { ...user!, has_accepted_ai_disclaimer: true } });
        // Assuming refreshUser or manual update is needed. 
        // For now, simple state update is enough for this session.
    } catch (error) {
        console.error("Failed to accept disclaimer:", error);
    }
  };

  // Journal store for AI context indicator
  const {
    settings: journalSettings,
    aiContext,
    loadSettings: loadJournalSettings,
    loadAIContext,
  } = useJournalStore();

  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load sessions and folders when token changes
  useEffect(() => {
    if (token) {
      loadSessions(token);
      loadFolders(token);
      // Load journal settings for AI context indicator
      loadJournalSettings(token);
      loadAIContext(token);
    }
  }, [token, loadSessions, loadFolders, loadJournalSettings, loadAIContext]);

  // Reload sessions when filter or activeFolderId changes
  useEffect(() => {
    if (token) {
      loadSessions(token);
    }
  }, [token, filter, activeFolderId, loadSessions]);

  // Load suggested prompts when token changes
  useEffect(() => {
    if (token) {
      loadSuggestedPrompts(token);
    }
  }, [token, loadSuggestedPrompts]);

  // Load summary when active session changes
  useEffect(() => {
    if (token && activeSession?.id) {
      loadSummary(token, activeSession.id);
    }
  }, [token, activeSession?.id, loadSummary]);

  // Session actions with token binding
  const handleLoadSession = (sessionId: number) => {
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
      // We don't block sending completely in a real app, usually we flag it. 
      // But here we show modal first. If user insists, they might just type again.
      // Or we can add a "send anyway" logic, but for safety, stopping and showing help is better.
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

  const handleToggleFavorite = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (token) toggleFavorite(token, sessionId);
  };

  const handleToggleTrash = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (token) toggleTrash(token, sessionId);
  };

  const handleDeletePermanent = (e: React.MouseEvent, sessionId: number) => {
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

  // Folder handlers
  const handleCreateFolder = async (name: string, color?: string) => {
    if (token) await createFolder(token, name, color);
  };

  const handleUpdateFolder = async (folderId: number, data: { name?: string; color?: string }) => {
    if (token) await updateFolder(token, folderId, data);
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (token) await deleteFolder(token, folderId);
  };

  const handleMoveToFolder = async (sessionId: number, folderId: number | null) => {
    if (token) await moveSessionToFolder(token, sessionId, folderId);
  };

  // Pin handler
  const handleTogglePin = async (messageId: number) => {
    if (token) await toggleMessagePin(token, messageId);
  };

  // Export handler
  const handleExport = async (format: "pdf" | "txt") => {
    if (token && activeSession) {
      await exportChat(token, activeSession.id, format);
    }
  };

  // Summary handler
  const handleGenerateSummary = async () => {
    if (token && activeSession) {
      await generateSummary(token, activeSession.id);
    }
  };

  // Suggested prompt handler - creates a new session and sends the prompt
  const handleSuggestedPrompt = async (prompt: string) => {
    if (!token) return;
    
    // Create a session with the prompt as title (truncated)
    const sessionTitle = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;
    await createSession(token, sessionTitle);
    
    // After session is created and loaded, send the prompt as first message
    // The createSession function already loads the session, so we can send the message
    await sendTextMessage(token, prompt);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <ChatMessagesArea
          activeSession={activeSession}
          messages={messages}
          userName={user?.name}
          isSending={isSending}
          isRecording={isRecording}
          messagesEndRef={messagesEndRef}
          onSendText={handleSendText}
          onSendAudio={handleSendAudio}
          onToggleMessageLike={handleToggleMessageLike}
          onToggleMessagePin={handleTogglePin}
          onCreateSession={() => setNewSessionDialog(true)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onExport={handleExport}
          summary={currentSummary}
          isGeneratingSummary={isGeneratingSummary}
          onGenerateSummary={handleGenerateSummary}
          suggestedPrompts={suggestedPrompts}
          onSuggestedPromptClick={handleSuggestedPrompt}
          journalAIAccessEnabled={journalSettings?.allow_ai_access}
          journalSharedCount={aiContext?.total_shared ?? 0}
        />
      </div>

      {/* Right Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        filter={filter}
        folders={folders}
        activeFolderId={activeFolderId}
        onFilterChange={setFilter}
        onSessionSelect={handleLoadSession}
        onCreateSession={() => setNewSessionDialog(true)}
        onToggleFavorite={handleToggleFavorite}
        onToggleTrash={handleToggleTrash}
        onDeletePermanent={handleDeletePermanent}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        onMoveToFolder={handleMoveToFolder}
        onFolderSelect={setActiveFolderId}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* New Session Dialog */}
      <NewSessionDialog
        open={newSessionDialog}
        onOpenChange={setNewSessionDialog}
        onCreateSession={handleCreateSession}
      />

      {/* AI Disclaimer Modal */}
      <AIDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
      />

      {/* Crisis Support Modal */}
      <CrisisSupportModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Permanen"
        description="Sesi ini akan dihapus secara permanen dan tidak dapat dipulihkan. Lanjutkan?"
        isLoading={isDeleting}
      />
    </div>
  );
}

