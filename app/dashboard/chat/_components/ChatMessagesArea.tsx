"use client";

import { useState } from "react";
import { ChatSession, ChatMessage, ChatSessionSummary, SuggestedPrompt } from "@/types";
import {
  ChatMessageBubble,
  ChatInput,
  EmptyState,
  TypingIndicator,
} from ".";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatSummaryPanel } from "./ChatSummaryPanel";
import { JournalContextIndicator } from "./JournalContextIndicator";

export interface ChatMessagesAreaProps {
  activeSession: ChatSession | null;
  messages: ChatMessage[];
  userName?: string;
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
  onSuggestedPromptClick?: (prompt: string) => void;
  journalAIAccessEnabled?: boolean;
  journalSharedCount?: number;
}

export function ChatMessagesArea({
  activeSession,
  messages,
  userName,
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
  onSuggestedPromptClick,
  journalAIAccessEnabled = false,
  journalSharedCount = 0,
}: ChatMessagesAreaProps) {
  const [showSummary, setShowSummary] = useState(false);
  const pinnedMessages = messages.filter(m => m.is_pinned);

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

      {showSummary && (
        <ChatSummaryPanel
          summary={summary}
          isGenerating={isGeneratingSummary || false}
          onGenerate={onGenerateSummary || (() => {})}
        />
      )}

      {journalAIAccessEnabled && (
        <JournalContextIndicator journalSharedCount={journalSharedCount} />
      )}

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 && suggestedPrompts && suggestedPrompts.length > 0 && (
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
            onToggleLike={onToggleMessageLike}
            onTogglePin={onToggleMessagePin}
          />
        ))}

        {isSending && <TypingIndicator isRecording={isRecording} />}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      <ChatInput
        onSendText={onSendText}
        onSendAudio={onSendAudio}
        disabled={isSending}
      />
    </>
  );
}
