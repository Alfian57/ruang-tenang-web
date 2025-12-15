"use client";

import Image from "next/image";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AudioPlayer } from "./AudioPlayer";
import { ChatMessage } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  userName?: string;
  onToggleLike: (messageId: number, isLike: boolean) => void;
}

/**
 * Renders a single chat message bubble with appropriate styling for user/AI messages.
 * Supports text and audio message types with like/dislike/copy actions for AI messages.
 */
export function ChatMessageBubble({ 
  message, 
  userName,
  onToggleLike 
}: ChatMessageBubbleProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const isUser = message.role === "user";
  const isAudio = message.type === "audio";

  const handleCopy = (content: string, messageId: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <Avatar className="w-10 h-10 shrink-0 mt-1">
          <AvatarFallback className="bg-transparent">
            <Image src="/images/ai-profile.png" alt="AI" width={40} height={40} />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[85%] lg:max-w-[75%] space-y-2">
        {/* Message bubble */}
        <div
          className={cn(
            "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm"
          )}
        >
          {isAudio ? (
            <div className="py-1">
              <AudioPlayer src={message.content} inverted={isUser} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Message metadata and actions */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-gray-400",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span>{formatDate(message.created_at)}</span>

          {/* Action buttons for AI messages */}
          {!isUser && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Copy button (only for text messages) */}
              {!isAudio && (
                <button
                  className="p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600"
                  title="Copy"
                  onClick={() => handleCopy(message.content, message.id)}
                >
                  {copiedId === message.id ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}

              {/* Like button */}
              <button
                className={cn(
                  "p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600",
                  message.is_liked && "text-primary"
                )}
                onClick={() => onToggleLike(message.id, true)}
                title="Like"
              >
                <ThumbsUp className={cn("w-3 h-3", message.is_liked && "fill-current")} />
              </button>

              {/* Dislike button */}
              <button
                className={cn(
                  "p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600",
                  message.is_disliked && "text-primary"
                )}
                onClick={() => onToggleLike(message.id, false)}
                title="Dislike"
              >
                <ThumbsDown className={cn("w-3 h-3", message.is_disliked && "fill-current")} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="w-10 h-10 shrink-0 mt-1">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {userName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
