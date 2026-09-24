"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Check, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AudioPlayer } from "./AudioPlayer";
import { ChatMessage } from "@/types";
import { cn, formatDate } from "@/utils";
import { getUploadUrl } from "@/services/http/upload-url";
import { RuNaAvatar } from "./RuNaAvatar";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  userName?: string;
  userAvatar?: string;
  onToggleLike: (messageId: number, isLike: boolean) => void;
  onTogglePin?: (messageId: number) => void;
}

/**
 * Renders a single chat message bubble with appropriate styling for user/AI messages.
 * Supports text and audio message types with like/dislike/copy actions for AI messages.
 */
export function ChatMessageBubble({
  message,
  userName,
  userAvatar,
  onToggleLike,
  onTogglePin
}: ChatMessageBubbleProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const isUser = message.role === "user";
  const isAudio = message.type === "audio";
  const trimmedUserAvatar = userAvatar?.trim() || "";
  const userAvatarSrc = trimmedUserAvatar
    ? (trimmedUserAvatar.startsWith("http") ? trimmedUserAvatar : getUploadUrl(trimmedUserAvatar))
    : "";

  const handleCopy = (content: string, messageId: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Renders message content with support for:
   * - Markdown links: [text](url)
   * - Bold text: **text**
   */
  const renderMessageContent = (content: string) => {
    // Regex to match markdown links and bold text
    const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Check for markdown link pattern [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium"
          >
            {linkText}
          </a>
        );
      }

      // Check for bold pattern **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "justify-end" : "justify-start"
      )}
      data-pinned={message.is_pinned}
    >
      {/* AI Avatar */}
      {!isUser && <RuNaAvatar />}

      <div className="max-w-[calc(100%-3rem)] space-y-2 sm:max-w-[78%]">
        {/* Pin indicator */}
        {message.is_pinned && (
          <div className={cn(
            "flex items-center gap-1 text-xs text-amber-600",
            isUser ? "justify-end" : "justify-start"
          )}>
            <Pin className="w-3 h-3" />
            <span>Disematkan</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:px-5",
            isUser
              ? "rounded-tr-md bg-primary text-white"
              : "rounded-tl-md border border-rose-100 bg-[#fff9f7] text-slate-800",
            message.is_pinned && !isUser && "ring-2 ring-amber-400/50"
          )}
        >
          {isAudio ? (
            <div className="py-1">
              <AudioPlayer src={message.content} inverted={isUser} />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {renderMessageContent(message.content)}
            </div>
          )}
        </div>

        {/* Message metadata and actions */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-slate-400",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span>{formatDate(message.created_at)}</span>

          {/* Action buttons for AI messages */}
          {!isUser && (
            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {/* Pin button */}
              <button
                className={cn(
                  "p-1 hover:bg-gray-100 rounded transition",
                  message.is_pinned ? "text-amber-500" : "text-gray-400 hover:text-gray-600"
                )}
                onClick={() => onTogglePin?.(message.id)}
                title={message.is_pinned ? "Hapus Sematkan" : "Sematkan"}
                aria-label={message.is_pinned ? "Hapus sematan" : "Sematkan pesan"}
              >
                <Pin className={cn("w-3 h-3", message.is_pinned && "fill-current")} />
              </button>

              {/* Copy button (only for text messages) */}
              {!isAudio && (
                <button
                  className="p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600"
                  title="Salin"
                  aria-label="Salin pesan"
                  onClick={() => handleCopy(message.content, message.id)}
                >
                  {copiedId === message.id ? (
                    <Check className="w-3 h-3 text-primary/80" />
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
                title="Suka"
                aria-label="Suka pesan"
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
                title="Tidak suka"
                aria-label="Tidak suka pesan"
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
          {userAvatarSrc && <AvatarImage src={userAvatarSrc} alt={userName || "User"} className="object-cover" />}
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {userName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
