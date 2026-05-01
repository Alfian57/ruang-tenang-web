"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChatSession,
  ChatMessage,
  ChatSessionSummary,
  SuggestedPrompt,
  ChatContextPreferencesUpdate,
  ChatContextState,
  BillingStatus,
} from "@/types";
import {
  ChatMessageBubble,
  ChatInput,
  EmptyState,
  TypingIndicator,
} from ".";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CreditCard, Crown, HeartHandshake, History, Lock, MessageSquare, NotebookPen, Phone, SlidersHorizontal, Wind } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatSummaryPanel } from "./ChatSummaryPanel";
import { JournalContextIndicator } from "./JournalContextIndicator";
import { AIDisclaimerBanner } from "@/components/ui/ai-disclaimer-banner";
import { ROUTES } from "@/lib/routes";

interface JourneyCompanionData {
  sessionsThisWeek: number;
  previousSession: {
    uuid: string;
    title: string;
    lastMessage?: string;
    updatedAt: string;
  } | null;
  quickPrompts: {
    id: string;
    label: string;
    text: string;
  }[];
}

interface CreativeModePrompt {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

interface ReflectionNudgeData {
  key: string;
  checkpoint: number;
  userMessageCount: number;
  prompt: string;
}

export interface ChatMessagesAreaProps {
  activeSession: ChatSession | null;
  messages: ChatMessage[];
  userName?: string;
  userAvatar?: string;
  isSending: boolean;
  isRecording: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSendText: (content: string) => Promise<void>;
  onSendAudio: (audioBlob: Blob) => Promise<void>;
  onToggleMessageLike: (messageId: number, isLike: boolean) => void;
  onToggleMessagePin?: (messageId: number) => void;
  onCreateSession: () => void;
  onOpenMobileSidebar?: () => void;
  onExport?: (format: "pdf" | "txt") => void;
  summary?: ChatSessionSummary | null;
  isGeneratingSummary?: boolean;
  onGenerateSummary?: () => void;
  suggestedPrompts?: SuggestedPrompt[];
  creativeModes?: CreativeModePrompt[];
  journeyCompanion?: JourneyCompanionData;
  reflectionNudge?: ReflectionNudgeData | null;
  billingStatus?: BillingStatus | null;
  onSuggestedPromptClick?: (prompt: string) => void;
  onCreativeModeClick?: (prompt: string) => void;
  onJourneyPromptClick?: (prompt: string) => void;
  onResumeJourneySession?: (sessionId: string) => Promise<void>;
  onRunReflectionNudge?: () => Promise<void>;
  onGenerateReflectionSummary?: () => Promise<void>;
  onDismissReflectionNudge?: () => void;
  contextState?: ChatContextState | null;
  isContextLoading?: boolean;
  isUpdatingContext?: boolean;
  onUpdateContextPreferences?: (updates: ChatContextPreferencesUpdate) => Promise<void> | void;
  journalAIAccessEnabled?: boolean;
  journalSharedCount?: number;
  isSafeModeActive?: boolean;
  pendingCrisisMessage?: string | null;
  chatQuotaNotice?: string | null;
  onContinueInSafeMode?: () => Promise<void>;
  onOpenCrisisSupport?: () => void;
  onOpenBreathingSupport?: () => void;
  onDismissSafeMode?: () => void;
  onOpenBillingFromQuota?: () => void;
}

export function ChatMessagesArea({
  activeSession,
  messages,
  userName,
  userAvatar,
  isSending,
  isRecording,
  messagesEndRef,
  onSendText,
  onSendAudio,
  onToggleMessageLike,
  onToggleMessagePin,
  onCreateSession,
  onOpenMobileSidebar,
  onExport,
  summary,
  isGeneratingSummary,
  onGenerateSummary,
  suggestedPrompts,
  creativeModes,
  journeyCompanion,
  reflectionNudge,
  billingStatus,
  onSuggestedPromptClick,
  onCreativeModeClick,
  onJourneyPromptClick,
  onResumeJourneySession,
  onRunReflectionNudge,
  onGenerateReflectionSummary,
  onDismissReflectionNudge,
  journalAIAccessEnabled = false,
  journalSharedCount = 0,
  isSafeModeActive = false,
  pendingCrisisMessage,
  chatQuotaNotice,
  onContinueInSafeMode,
  onOpenCrisisSupport,
  onOpenBreathingSupport,
  onDismissSafeMode,
  onOpenBillingFromQuota,
}: ChatMessagesAreaProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [showMobileAssistPanels, setShowMobileAssistPanels] = useState(false);
  const pinnedMessages = messages.filter(m => m.is_pinned);
  const isPremium = Boolean(billingStatus?.is_premium || billingStatus?.chat_quota.is_unlimited);
  const quota = billingStatus?.chat_quota;
  const isQuotaExhausted = Boolean(chatQuotaNotice || (quota && !isPremium && quota.remaining <= 0));
  const quotaPercent = quota && quota.limit > 0
    ? Math.max(0, Math.min(100, (quota.remaining / quota.limit) * 100))
    : 100;
  const quotaResetLabel = quota?.reset_at
    ? new Date(quota.reset_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;
  const mobilePanelCount = 1
    + (journalAIAccessEnabled && journalSharedCount > 0 ? 1 : 0)
    + (reflectionNudge ? 1 : 0);

  if (!activeSession) {
    return (
      <>
        <div className="sm:hidden flex items-center justify-between p-4 border-b bg-white shrink-0">
          <h3 className="font-semibold text-gray-800">Chat Baru</h3>
          <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar}>
            <History className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <EmptyState
            onCreateSession={onCreateSession}
            suggestedPrompts={suggestedPrompts}
            onSuggestedPromptClick={onSuggestedPromptClick}
            creativeModes={creativeModes}
            onCreativeModeClick={onCreativeModeClick}
            journeyCompanion={journeyCompanion}
            onJourneyPromptClick={onJourneyPromptClick}
            onResumeJourneySession={onResumeJourneySession}
            billingStatus={billingStatus}
            chatQuotaNotice={chatQuotaNotice}
            onOpenBillingFromQuota={onOpenBillingFromQuota}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <ChatHeader
        activeSession={activeSession}
        messageCount={messages.length}
        pinnedCount={pinnedMessages.length}
        showSummary={showSummary}
        onToggleSummary={() => setShowSummary(!showSummary)}
        onExport={onExport}
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {quota && (
        <div className={`shrink-0 border-b px-4 py-2 ${isPremium ? "border-violet-100 bg-violet-50" : isQuotaExhausted ? "border-amber-200 bg-amber-100" : "border-amber-100 bg-amber-50"}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              {isPremium ? (
                <Crown className="h-4 w-4 text-violet-600" />
              ) : isQuotaExhausted ? (
                <Lock className="h-4 w-4 text-amber-700" />
              ) : (
                <MessageSquare className="h-4 w-4 text-amber-600" />
              )}
              <span className={`font-semibold ${isPremium ? "text-violet-900" : "text-amber-900"}`}>
                {isPremium ? "Premium aktif: chat tanpa batas" : isQuotaExhausted ? "Limit chat gratis habis" : `Kuota gratis: ${Math.max(0, quota.remaining)} dari ${quota.limit} tersisa`}
              </span>
            </div>

            {!isPremium && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${quotaPercent}%` }} />
                </div>
                <Button size="sm" variant="outline" className="h-7 border-amber-300 bg-white text-amber-800 hover:bg-amber-100" onClick={onOpenBillingFromQuota}>
                  {isQuotaExhausted ? <Lock className="mr-1 h-3.5 w-3.5" /> : <CreditCard className="mr-1 h-3.5 w-3.5" />}
                  {isQuotaExhausted ? "Buka Premium" : "Upgrade"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="sm:hidden shrink-0 border-b border-gray-100 bg-white px-4 py-2">
          <button
            type="button"
            onClick={() => setShowMobileAssistPanels((prev) => !prev)}
            className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Panel Info Chat ({mobilePanelCount})
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              {showMobileAssistPanels ? "Sembunyikan" : "Tampilkan"}
              {showMobileAssistPanels ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          </button>
        </div>

        {/* Helper Components placed above scroll area */}
        {showSummary && (
          <div className="shrink-0 z-10 border-b">
            <ChatSummaryPanel
              summary={summary}
              isGenerating={isGeneratingSummary || false}
              onGenerate={onGenerateSummary || (() => { })}
            />
          </div>
        )}

        <div className={`shrink-0 z-10 ${showMobileAssistPanels ? "block" : "hidden"} sm:block`}>
          <AIDisclaimerBanner />
        </div>

        {journalAIAccessEnabled && (
          <div className={`shrink-0 z-10 ${showMobileAssistPanels ? "block" : "hidden"} sm:block`}>
            <JournalContextIndicator journalSharedCount={journalSharedCount} />
          </div>
        )}

        {reflectionNudge && (
          <div className={`shrink-0 z-10 border-b border-violet-200 bg-violet-50 px-4 py-3 ${showMobileAssistPanels ? "block" : "hidden"} sm:block`}>
            <div className="flex items-start gap-2">
              <NotebookPen className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-violet-900">
                  Checkpoint refleksi #{reflectionNudge.checkpoint} setelah {reflectionNudge.userMessageCount} pesan.
                </p>
                <p className="text-xs text-violet-700">
                  Ambil 2 menit untuk merangkum pola emosi, kebutuhan utama, dan langkah kecil berikutnya.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={onRunReflectionNudge}>
                    Refleksi 2 Menit
                  </Button>
                  <Button size="sm" variant="outline" onClick={onGenerateReflectionSummary}>
                    Ringkas + Refleksi
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onDismissReflectionNudge}>
                    Nanti Dulu
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isSafeModeActive && (
          <div className="shrink-0 z-10 border-b border-rose-200 bg-rose-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-rose-800">
                  Kami mendeteksi kata yang mengarah ke kondisi berat. Kamu bisa lanjut lewat mode aman dengan langkah yang lebih sederhana.
                </p>
                {pendingCrisisMessage && (
                  <p className="text-xs text-rose-700 line-clamp-2">Pesan terdeteksi: &quot;{pendingCrisisMessage}&quot;</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={onContinueInSafeMode}>
                    Lanjutkan Mode Aman
                  </Button>
                  <Button size="sm" variant="outline" onClick={onOpenBreathingSupport}>
                    Atur Napas 2 Menit
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={onOpenCrisisSupport}>
                    <Phone className="w-3.5 h-3.5" />
                    Hubungi Bantuan
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onDismissSafeMode}>
                    Kembali ke Chat Biasa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {chatQuotaNotice && !isSafeModeActive && (
          <div className="shrink-0 z-10 border-b border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-amber-900">Kuota chat periode ini sudah habis</p>
                <p className="text-xs text-amber-800">{chatQuotaNotice}</p>
                {quotaResetLabel && (
                  <p className="text-xs font-medium text-amber-900">Reset kuota berikutnya: {quotaResetLabel}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={onOpenBillingFromQuota}>
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Upgrade Premium
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
                    <Link href={ROUTES.JOURNAL}>
                      <NotebookPen className="w-3.5 h-3.5 mr-1" />
                      Tulis Jurnal
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
                    <Link href={ROUTES.BREATHING}>
                      <Wind className="w-3.5 h-3.5 mr-1" />
                      Atur Napas
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.length === 0 && !isSafeModeActive && suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">Mulai percakapan dengan salah satu prompt berikut:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isQuotaExhausted) {
                        onOpenBillingFromQuota?.();
                        return;
                      }

                      onSuggestedPromptClick?.(prompt.text);
                    }}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors text-left ${isQuotaExhausted ? "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100" : "bg-gray-100 hover:bg-primary/10 hover:text-primary"}`}
                    title={isQuotaExhausted ? "Limit chat habis, buka Premium untuk lanjut" : undefined}
                  >
                    {isQuotaExhausted && <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />}
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              userName={userName}
              userAvatar={userAvatar}
              onToggleLike={onToggleMessageLike}
              onTogglePin={onToggleMessagePin}
            />
          ))}

          {isSending && <TypingIndicator isRecording={isRecording} />}

          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      <ChatInput
        onSendText={onSendText}
        onSendAudio={onSendAudio}
        disabled={isSending || isSafeModeActive || isQuotaExhausted}
        disabledReason={isQuotaExhausted ? "Kuota chat gratis habis. Upgrade Premium atau tunggu reset kuota." : undefined}
      />
    </>
  );
}
