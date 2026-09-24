"use client";

import { useState, useRef, FormEvent, useEffect, useCallback } from "react";
import { AudioLines, Lock, Mic, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { VoiceInput } from "./VoiceInput";
import { useAudioRecorder } from "../_hooks/useAudioRecorder";

interface ChatInputProps {
  onSendText: (content: string) => Promise<boolean>;
  onSendAudio: (audioBlob: Blob) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

export function ChatInput({ onSendText, onSendAudio, disabled = false, disabledReason }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isSendingText, setIsSendingText] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    isRecording,
    recordingDuration,
    isSending: isSendingAudio,
    startRecording,
    stopRecording,
    formatRecordingTime
  } = useAudioRecorder({
    onRecordingComplete: onSendAudio
  });

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSendingText || isSendingAudio || disabled) return;

    const content = input.trim();
    setInput("");
    setIsSendingText(true);

    try {
      const sent = await onSendText(content);
      if (!sent) setInput(content);
    } finally {
      setIsSendingText(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleVoiceTranscript = async (transcript: string): Promise<boolean> => {
    if (!transcript.trim()) return false;
    setIsSendingText(true);
    try {
      return await onSendText(transcript);
    } finally {
      setIsSendingText(false);
    }
  };

  const isInputDisabled = isSendingText || isSendingAudio || disabled;

  return (
    <div data-user-tour="chat-composer" className="shrink-0 border-t border-rose-100 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-5">
      {disabledReason && (
        <div className="mx-auto mb-2 flex max-w-4xl min-w-0 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>{disabledReason}</span>
        </div>
      )}
      <div className="mx-auto flex max-w-4xl min-w-0 items-end gap-2">
        {isRecording ? (
          <div className="flex-1 min-w-0 bg-red-50 rounded-2xl border border-red-100 p-2 flex flex-col gap-2 animate-pulse xs:flex-row xs:items-center xs:justify-between">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-bold text-red-600 tabular-nums">
                {formatRecordingTime(recordingDuration)}
              </span>
            </div>
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="sm"
              className="h-8 rounded-xl px-3 xs:px-4"
            >
              <Square className="w-3 h-3 mr-2" />
              <span className="hidden xs:inline">Hentikan & Kirim</span>
              <span className="xs:hidden">Kirim</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex min-w-0 items-end gap-2">
            <div className="flex min-w-0 flex-1 items-end rounded-[1.35rem] border border-slate-200 bg-[#fffdfc] p-1.5 shadow-[0_8px_25px_-16px_rgba(113,45,48,0.35)] transition-all focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ceritakan yang sedang kamu rasakan..."
                disabled={isInputDisabled}
                rows={1}
                className="min-h-[36px] max-h-[150px] min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:px-3"
                autoComplete="off"
              />

              <Button
                type="button"
                onClick={() => setShowVoiceInput(true)}
                disabled={isInputDisabled || !!input.trim()}
                size="icon"
                variant="ghost"
                className="rounded-xl w-8 h-8 shrink-0 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors mr-1"
                title="Bicara dengan RuNa (suara diubah menjadi teks)"
                aria-label="Bicara dengan RuNa, suara diubah menjadi teks"
              >
                <Mic className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                onClick={startRecording}
                disabled={isInputDisabled || !!input.trim()}
                size="icon"
                variant="ghost"
                className="rounded-xl w-8 h-8 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mr-1"
                title="Kirim rekaman suara tanpa transkripsi"
                aria-label="Kirim rekaman suara tanpa transkripsi"
              >
                <AudioLines className="w-4 h-4" />
              </Button>

              <Button
                type="submit"
                disabled={!input.trim() || isInputDisabled}
                size="icon"
                aria-label="Kirim pesan"
                className={cn(
                  "rounded-xl w-8 h-8 shrink-0 transition-all",
                  !input.trim()
                    ? "bg-gray-200 text-gray-400"
                    : "bg-primary hover:bg-primary/90 text-white shadow-sm"
                )}
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {showVoiceInput && (
        <VoiceInput
          onTranscriptComplete={handleVoiceTranscript}
          onClose={() => setShowVoiceInput(false)}
          disabled={disabled}
        />
      )}
    </div>
  );
}
