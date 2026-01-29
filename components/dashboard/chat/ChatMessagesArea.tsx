"use client";

import { useState } from "react";
import { ChatSession, ChatMessage, ChatSessionSummary, SuggestedPrompt } from "@/types";
import {
  ChatMessageBubble,
  ChatInput,
  EmptyState,
  TypingIndicator,
} from "@/components/dashboard/chat";
import { Button } from "@/components/ui/button";
import {
  History,
  Download,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Props for the ChatMessagesArea component.
 */
export interface ChatMessagesAreaProps {
  /** The currently active chat session */
  activeSession: ChatSession | null;
  /** List of messages in the active session */
  messages: ChatMessage[];
  /** Current user's name for display */
  userName?: string;
  /** Whether a message is currently being sent */
  isSending: boolean;
  /** Whether audio is being recorded */
  isRecording: boolean;
  /** Ref for scrolling to the bottom of messages */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  /** Callback to send a text message */
  onSendText: (content: string) => Promise<void>;
  /** Callback to send an audio message */
  onSendAudio: (audioBlob: Blob) => Promise<void>;
  /** Callback to toggle like/dislike on a message */
  onToggleMessageLike: (messageId: number, isLike: boolean) => void;
  /** Callback to toggle pin on a message */
  onToggleMessagePin?: (messageId: number) => void;
  /** Callback to create a new session (for empty state) */
  onCreateSession: () => void;
  /** Callback to open mobile sidebar */
  onOpenMobileSidebar?: () => void;
  /** Callback to export chat */
  onExport?: (format: "pdf" | "txt") => void;
  /** Current session summary */
  summary?: ChatSessionSummary | null;
  /** Whether summary is being generated */
  isGeneratingSummary?: boolean;
  /** Callback to generate summary */
  onGenerateSummary?: () => void;
  /** Suggested prompts for empty/new conversations */
  suggestedPrompts?: SuggestedPrompt[];
  /** Callback when a suggested prompt is clicked */
  onSuggestedPromptClick?: (prompt: string) => void;
}

/**
 * Main chat messages display area.
 * Shows the message list, typing indicator, and input area.
 */
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
}: ChatMessagesAreaProps) {
  const [showSummary, setShowSummary] = useState(false);
  const pinnedMessages = messages.filter(m => m.is_pinned);

  if (!activeSession) {
    return (
      <>
        {/* Mobile Header for Empty State */}
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
      {/* Header with title and actions */}
      <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
        <h3 className="font-semibold text-gray-800 line-clamp-1 flex-1">{activeSession.title}</h3>

        <div className="flex items-center gap-2">
          {/* Summary Button */}
          {messages.length >= 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
              className="text-gray-600 hover:text-primary"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ringkasan</span>
              {showSummary ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          )}

          {/* Pinned Messages Indicator */}
          {pinnedMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:text-amber-700"
              onClick={() => {
                // Scroll to first pinned message
                const firstPinned = document.querySelector('[data-pinned="true"]');
                firstPinned?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <Pin className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{pinnedMessages.length}</span>
            </Button>
          )}

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
                <Download className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport?.("pdf")}>
                <FileText className="w-4 h-4 mr-2" />
                Export sebagai PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.("txt")}>
                <FileText className="w-4 h-4 mr-2" />
                Export sebagai TXT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile sidebar toggle */}
          <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar} className="lg:hidden">
            <History className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Summary Panel */}
      {showSummary && (
        <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Ringkasan Percakapan
            </h4>
            {(!summary || !summary.summary) && (
              <Button
                size="sm"
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
                className="text-xs"
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Buat Ringkasan
                  </>
                )}
              </Button>
            )}
          </div>

          {summary && summary.summary ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>

              {summary.topics && summary.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Topik:</span>
                  {summary.topics.map((topic, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {summary.mood && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Mood:</span> {summary.mood}
                </p>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
                className="text-xs text-gray-500 hover:text-primary"
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Perbarui Ringkasan
                  </>
                )}
              </Button>
            </div>
          ) : !isGeneratingSummary ? (
            <p className="text-sm text-gray-500">Belum ada ringkasan. Klik tombol untuk membuat ringkasan percakapan.</p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Membuat ringkasan...
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {/* Suggested prompts at start of conversation */}
        {messages.length === 0 && suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-3">Mulai percakapan dengan salah satu prompt berikut:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestedPromptClick?.(prompt.prompt)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                >
                  {prompt.prompt}
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

        {/* Typing indicator */}
        {isSending && <TypingIndicator isRecording={isRecording} />}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendText={onSendText}
        onSendAudio={onSendAudio}
        disabled={isSending}
      />
    </>
  );
}
