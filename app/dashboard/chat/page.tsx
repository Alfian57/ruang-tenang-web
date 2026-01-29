"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import {
  ChatSidebar,
  NewSessionDialog,
  ChatMessagesArea,
} from "@/components/dashboard/chat";

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
    }
  }, [token, loadSessions, loadFolders]);

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

  // Suggested prompt handler
  const handleSuggestedPrompt = (prompt: string) => {
    if (token) sendTextMessage(token, prompt);
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
