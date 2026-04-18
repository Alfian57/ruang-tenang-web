"use client";

import { useState } from "react";
import {
  ChatSession,
  ChatMessage,
  ChatSessionSummary,
  SuggestedPrompt,
  ChatContextPreferencesUpdate,
  ChatContextState,
  ChatSessionIntent,
} from "@/types";
import {
  ChatMessageBubble,
  ChatInput,
  EmptyState,
  TypingIndicator,
} from ".";
import { Button } from "@/components/ui/button";
import { Compass, HeartHandshake, History, NotebookPen, Phone } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatSummaryPanel } from "./ChatSummaryPanel";
import { JournalContextIndicator } from "./JournalContextIndicator";
import { AIDisclaimerBanner } from "@/components/ui/ai-disclaimer-banner";
import { Switch } from "@/components/ui/switch";

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
  onContinueInSafeMode?: () => Promise<void>;
  onOpenCrisisSupport?: () => void;
  onOpenBreathingSupport?: () => void;
  onDismissSafeMode?: () => void;
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
  onSuggestedPromptClick,
  onCreativeModeClick,
  onJourneyPromptClick,
  onResumeJourneySession,
  onRunReflectionNudge,
  onGenerateReflectionSummary,
  onDismissReflectionNudge,
  contextState,
  isContextLoading = false,
  isUpdatingContext = false,
  onUpdateContextPreferences,
  journalAIAccessEnabled = false,
  journalSharedCount = 0,
  isSafeModeActive = false,
  pendingCrisisMessage,
  onContinueInSafeMode,
  onOpenCrisisSupport,
  onOpenBreathingSupport,
  onDismissSafeMode,
}: ChatMessagesAreaProps) {
  const [showSummary, setShowSummary] = useState(false);
  const pinnedMessages = messages.filter(m => m.is_pinned);
  const contextPrefs = contextState?.preferences;
  const contextRuntime = contextState?.runtime;
  const contextDisabled = isContextLoading || isUpdatingContext || !contextPrefs;

  const intentOptions: { value: ChatSessionIntent; label: string }[] = [
    { value: "general", label: "Umum" },
    { value: "grounding", label: "Grounding" },
    { value: "planning", label: "Planning" },
    { value: "reflection", label: "Refleksi" },
    { value: "coping", label: "Coping" },
  ];

  const sourceLabelMap: Record<string, string> = {
    mood: "Mood",
    journal: "Jurnal",
    daily_task: "Tugas harian",
    xp_level: "XP/Level",
    breathing: "Napas",
    playlist: "Playlist",
    rewards: "Rewards",
    progress_map: "Progress map",
    social: "Sosial",
  };

  const activeSourceLabels = (contextRuntime?.effective_sources ?? [])
    .map((source) => sourceLabelMap[source] ?? source)
    .join(", ");

  const updateContextPreference = (updates: ChatContextPreferencesUpdate) => {
    if (!onUpdateContextPreferences) return;
    void onUpdateContextPreferences(updates);
  };

  if (!activeSession) {
    return (
      <>
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white shrink-0">
          <h3 className="font-semibold text-gray-800">Chat Baru</h3>
          <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar}>
            <History className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        <EmptyState
          onCreateSession={onCreateSession}
          suggestedPrompts={suggestedPrompts}
          onSuggestedPromptClick={onSuggestedPromptClick}
          creativeModes={creativeModes}
          onCreativeModeClick={onCreativeModeClick}
          journeyCompanion={journeyCompanion}
          onJourneyPromptClick={onJourneyPromptClick}
          onResumeJourneySession={onResumeJourneySession}
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
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
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

        <div className="shrink-0 z-10">
          <AIDisclaimerBanner />
        </div>

        {contextState && (
          <div className="shrink-0 z-10 border-b border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-900">Smart Context AI</p>
                <p className="text-xs text-emerald-800">
                  {isContextLoading
                    ? "Memuat preferensi context..."
                    : activeSourceLabels
                      ? `Sumber aktif: ${activeSourceLabels}`
                      : "Belum ada sumber context aktif."}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {intentOptions.map((intent) => (
                  <button
                    key={intent.value}
                    type="button"
                    disabled={contextDisabled}
                    onClick={() => updateContextPreference({ session_intent: intent.value })}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${contextPrefs?.session_intent === intent.value
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      } ${contextDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Mood</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_mood_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_mood_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Jurnal ({contextRuntime?.journal_shared_count ?? 0})</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_journal_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_journal_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Tugas</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_daily_task_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_daily_task_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>XP/Level</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_xp_level_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_xp_level_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Napas</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_breathing_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_breathing_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Playlist ({contextRuntime?.playlist?.total_playlists ?? 0})</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_playlist_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_playlist_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Rewards ({contextRuntime?.rewards?.claim_count ?? 0})</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_rewards_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_rewards_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Progress Map</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_progress_map_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_progress_map_context: checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                <span>Sosial ({contextRuntime?.social?.badge_count ?? 0})</span>
                <Switch
                  checked={Boolean(contextPrefs?.enable_social_context)}
                  disabled={contextDisabled}
                  onCheckedChange={(checked) => updateContextPreference({ enable_social_context: checked })}
                />
              </label>
            </div>
          </div>
        )}

        {journalAIAccessEnabled && (
          <div className="shrink-0 z-10">
            <JournalContextIndicator journalSharedCount={journalSharedCount} />
          </div>
        )}

        {journeyCompanion && (
          <div className="shrink-0 z-10 border-b border-sky-200 bg-sky-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-sky-900">
              <Compass className="w-4 h-4 text-sky-600" />
              <span className="font-medium">
                Journey Companion: {journeyCompanion.sessionsThisWeek} sesi kamu aktif dalam 7 hari terakhir.
              </span>
            </div>
            {journeyCompanion.previousSession && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sky-200 bg-white text-sky-700 hover:bg-sky-100"
                  onClick={() => {
                    const session = journeyCompanion.previousSession;
                    if (!session) return;
                    void onResumeJourneySession?.(session.uuid);
                  }}
                >
                  Lanjutkan: {journeyCompanion.previousSession.title}
                </Button>
                {journeyCompanion.previousSession.lastMessage && (
                  <p className="text-xs text-sky-700 line-clamp-1 max-w-135">
                    {journeyCompanion.previousSession.lastMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {reflectionNudge && (
          <div className="shrink-0 z-10 border-b border-violet-200 bg-violet-50 px-4 py-3">
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

        {/* Main Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.length === 0 && !isSafeModeActive && suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">Mulai percakapan dengan salah satu prompt berikut:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSuggestedPromptClick?.(prompt.text)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                  >
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
        disabled={isSending || isSafeModeActive}
      />
    </>
  );
}
