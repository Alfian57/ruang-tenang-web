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
    isSafeModeActive,
    pendingCrisisMessage,
    chatQuotaNotice,
    currentSummary,
    isGeneratingSummary,
    suggestedPrompts,
    journeyCompanion,
    reflectionNudge,
    billingStatus,
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
    handleOpenBillingFromQuota,
  } = useChatPage();

  return (
    <div className="grid h-[calc(100svh-4rem)] min-w-0 grid-cols-1 overflow-hidden bg-white sm:h-[calc(100vh-4rem)] sm:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
      {/* Main Chat Area */}
      <div className="min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        <ChatMessagesArea
          activeSession={activeSession}
          messages={messages}
          userName={user?.name}
          userAvatar={user?.avatar}
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
          creativeModes={journeyCompanion?.creativeModes}
          journeyCompanion={journeyCompanion}
          reflectionNudge={reflectionNudge}
          billingStatus={billingStatus}
          onSuggestedPromptClick={handleSuggestedPrompt}
          onCreativeModeClick={handleSuggestedPrompt}
          onJourneyPromptClick={handleSuggestedPrompt}
          onResumeJourneySession={handleResumeJourneySession}
          onRunReflectionNudge={handleRunReflectionNudge}
          onGenerateReflectionSummary={handleGenerateReflectionSummary}
          onDismissReflectionNudge={handleDismissReflectionNudge}
          journalAIAccessEnabled={journalSettings?.allow_ai_access}
          journalSharedCount={aiContext?.total_shared ?? 0}
          contextState={chatContextState}
          isContextLoading={isContextLoading}
          isUpdatingContext={isUpdatingContext}
          onUpdateContextPreferences={handleUpdateContextPreferences}
          isSafeModeActive={isSafeModeActive}
          pendingCrisisMessage={pendingCrisisMessage}
          chatQuotaNotice={chatQuotaNotice}
          onContinueInSafeMode={handleContinueInSafeMode}
          onOpenCrisisSupport={handleOpenCrisisSupport}
          onOpenBreathingSupport={handleOpenBreathingSupport}
          onDismissSafeMode={handleDismissSafeMode}
          onOpenBillingFromQuota={handleOpenBillingFromQuota}
        />
      </div>

      {/* Chat Sidebar: inline on desktop, drawer on mobile */}
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
        isChatLocked={Boolean(chatQuotaNotice)}
        onOpenBillingFromQuota={handleOpenBillingFromQuota}
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
