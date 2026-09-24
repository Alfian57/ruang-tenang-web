"use client";

import Image from "next/image";
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
import { ChevronDown, ChevronUp, CreditCard, HeartHandshake, History, Lock, MessageSquare, NotebookPen, Phone, ShieldCheck } from "lucide-react";
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
  onSendText: (content: string) => Promise<boolean>;
  onSendAudio: (audioBlob: Blob) => Promise<void>;
  onToggleMessageLike: (messageId: number, isLike: boolean) => void;
  onToggleMessagePin?: (messageId: number) => void;
  onOpenMobileSidebar?: () => void;
  onExport?: (format: "pdf" | "txt") => void;
  summary?: ChatSessionSummary | null;
  isGeneratingSummary?: boolean;
  onGenerateSummary?: () => void;
  suggestedPrompts?: SuggestedPrompt[];
  journeyCompanion?: JourneyCompanionData;
  reflectionNudge?: ReflectionNudgeData | null;
  billingStatus?: BillingStatus | null;
  onSuggestedPromptClick?: (prompt: string) => void;
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
  onOpenMobileSidebar,
  onExport,
  summary,
  isGeneratingSummary,
  onGenerateSummary,
  suggestedPrompts,
  journeyCompanion,
  reflectionNudge,
  billingStatus,
  onSuggestedPromptClick,
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
  onDismissSafeMode,
  onOpenBillingFromQuota,
}: ChatMessagesAreaProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [showAssistPanels, setShowAssistPanels] = useState(false);
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
  const assistPanelCount = 1
    + (journalAIAccessEnabled && journalSharedCount > 0 ? 1 : 0)
    + (reflectionNudge ? 1 : 0);

  if (!activeSession) {
    return (
      <>
        <div className="flex shrink-0 items-center justify-between border-b border-rose-100 bg-white px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-slate-800">Obrolan dengan RuNa</span>
          <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar} aria-label="Buka riwayat chat">
            <History className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <EmptyState
            suggestedPrompts={suggestedPrompts}
            onSuggestedPromptClick={onSuggestedPromptClick}
            journeyCompanion={journeyCompanion}
            onJourneyPromptClick={onJourneyPromptClick}
            onResumeJourneySession={onResumeJourneySession}
            billingStatus={billingStatus}
            chatQuotaNotice={chatQuotaNotice}
            onOpenBillingFromQuota={onOpenBillingFromQuota}
          />
        </div>

        {/* Direct chat input: sending the first message auto-creates a session
            and the title is generated automatically (GPT/Gemini/Claude style). */}
        <ChatInput
          onSendText={onSendText}
          onSendAudio={onSendAudio}
          disabled={isSending || isQuotaExhausted}
          disabledReason={isQuotaExhausted ? "Kuota chat gratis habis. Upgrade Premium atau tunggu reset kuota." : undefined}
        />
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
        isPremium={isPremium}
      />

      {quota && !isPremium && (
        <div className={`shrink-0 border-b px-4 py-2 ${isQuotaExhausted ? "border-amber-200 bg-amber-100" : "border-amber-100 bg-amber-50"}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              {isQuotaExhausted ? (
                <Lock className="h-4 w-4 text-amber-700" />
              ) : (
                <MessageSquare className="h-4 w-4 text-amber-600" />
              )}
              <span className="font-semibold text-amber-900">
                {isQuotaExhausted ? "Limit chat gratis habis" : `Kuota gratis: ${Math.max(0, quota.remaining)} dari ${quota.limit} tersisa`}
              </span>
            </div>

            <div className="flex items-center gap-2">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${quotaPercent}%` }} />
                </div>
                <Button size="sm" variant="outline" className="h-7 border-amber-300 bg-white text-amber-800 hover:bg-amber-100" onClick={onOpenBillingFromQuota}>
                  {isQuotaExhausted ? <Lock className="mr-1 h-3.5 w-3.5" /> : <CreditCard className="mr-1 h-3.5 w-3.5" />}
                  {isQuotaExhausted ? "Buka Premium" : "Upgrade"}
                </Button>
              </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="shrink-0 border-b border-rose-100 bg-white px-4 py-2">
          <button
            type="button"
            onClick={() => setShowAssistPanels((prev) => !prev)}
            aria-expanded={showAssistPanels}
            className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-xl px-2 py-1.5 text-left transition hover:bg-rose-50"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-rose-600" />
              Privasi & info percakapan
              {assistPanelCount > 1 && <span className="rounded-full bg-rose-50 px-1.5 text-rose-700">{assistPanelCount}</span>}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              {showAssistPanels ? "Tutup" : "Lihat"}
              {showAssistPanels ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
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

        <div className={`shrink-0 z-10 ${showAssistPanels ? "block" : "hidden"}`}>
          <AIDisclaimerBanner />
        </div>

        {journalAIAccessEnabled && (
          <div className={`shrink-0 z-10 ${showAssistPanels ? "block" : "hidden"}`}>
            <JournalContextIndicator journalSharedCount={journalSharedCount} />
          </div>
        )}

        {reflectionNudge && (
          <div className={`shrink-0 z-10 border-b border-primary/20 bg-primary/10 px-4 py-3 ${showAssistPanels ? "block" : "hidden"}`}>
            <div className="flex items-start gap-2">
              <NotebookPen className="w-4 h-4 text-primary/80 mt-0.5 shrink-0" />
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-primary">
                  Checkpoint refleksi #{reflectionNudge.checkpoint} setelah {reflectionNudge.userMessageCount} pesan.
                </p>
                <p className="text-xs text-primary">
                  Ambil 2 menit untuk merangkum pola emosi, kebutuhan utama, dan langkah kecil berikutnya.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary" onClick={onRunReflectionNudge}>
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
          <div className="shrink-0 z-10 border-b border-primary/20 bg-primary/10 px-4 py-3">
            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-primary/80 mt-0.5 shrink-0" />
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-primary">
                  Kami mendeteksi kata yang mengarah ke kondisi berat. Kamu bisa lanjut lewat mode aman dengan langkah yang lebih sederhana.
                </p>
                {pendingCrisisMessage && (
                  <p className="text-xs text-primary line-clamp-2">Pesan terdeteksi: &quot;{pendingCrisisMessage}&quot;</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary" onClick={onContinueInSafeMode}>
                    Lanjutkan Mode Aman
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Scroll Area */}
        <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffaf8_0%,#fff_26%)] px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-4xl space-y-5">
          {messages.length === 0 && !isSafeModeActive && suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="flex flex-col items-center py-8 text-center sm:py-12">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-rose-100 bg-rose-50">
                <Image src="/images/dashboard/mascot/chat-listen.webp" alt="RuNa" width={64} height={64} className="h-14 w-14 object-contain" />
              </div>
              <p className="text-base font-semibold text-slate-800">RuNa siap mendengarkan</p>
              <p className="mt-1 text-sm text-slate-500">Ceritakan saja apa yang ada di pikiranmu, atau pilih satu ide.</p>
              <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                {suggestedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => {
                      if (isQuotaExhausted) {
                        onOpenBillingFromQuota?.();
                        return;
                      }

                      onSuggestedPromptClick?.(prompt.text);
                    }}
                    className={`max-w-full rounded-full border px-4 py-2 text-left text-sm shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${isQuotaExhausted ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100" : "border-rose-100 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700"}`}
                    title={isQuotaExhausted ? "Limit chat habis, buka Premium untuk lanjut" : undefined}
                  >
                    {isQuotaExhausted && <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />}
                    <span className="block max-w-[15rem] truncate">{prompt.text}</span>
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
