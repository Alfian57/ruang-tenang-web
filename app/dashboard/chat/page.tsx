"use client";

import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import {
  ChatSidebar,
  NewSessionDialog,
  ChatMessagesArea,
} from "./_components";
import { AIDisclaimerModal } from "@/components/ui/ai-disclaimer-modal";
import { CrisisSupportModal } from "@/components/shared/moderation";
import { useChatPage } from "./_hooks/useChatPage";

/**
 * Chat page component for AI-powered mental health conversations.
 * Allows users to create sessions, send text/voice messages, and manage chat history.
 */
export default function ChatPage() {
  const {
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
  } = useChatPage();

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
        activeSessionId={activeSession?.uuid ?? null}
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
