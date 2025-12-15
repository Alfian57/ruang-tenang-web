"use client";

import { ChatSession, ChatMessage } from "@/types";
import {
  ChatMessageBubble,
  ChatInput,
  EmptyState,
  TypingIndicator,
} from "@/components/dashboard/chat";

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
  /** Callback to create a new session (for empty state) */
  onCreateSession: () => void;
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
  onCreateSession,
}: ChatMessagesAreaProps) {
  if (!activeSession) {
    return <EmptyState onCreateSession={onCreateSession} />;
  }

  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            userName={userName}
            onToggleLike={onToggleMessageLike}
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
