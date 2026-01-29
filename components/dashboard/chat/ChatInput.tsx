"use client";

import { useState, useRef, FormEvent, useEffect, useCallback } from "react";
import { Send, Mic, Square, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoiceInput } from "./VoiceInput";

interface ChatInputProps {
  onSendText: (content: string) => Promise<void>;
  onSendAudio: (audioBlob: Blob) => Promise<void>;
  disabled?: boolean;
}

/**
 * Chat input component with text input and voice recording capability.
 */
export function ChatInput({ onSendText, onSendAudio, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea on input change
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

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || disabled) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await onSendText(content);
    } finally {
      setIsSending(false);
      // Refocus the textarea after sending with delay to ensure state updates complete
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("ChatInput.startRecording: failed to access microphone", error);
      alert("Gagal mengakses mikrofon. Pastikan izin telah diberikan.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
    setIsSending(true);

    try {
      await onSendAudio(audioBlob);
    } finally {
      setIsSending(false);
    }
  };

  // Handle voice input transcript completion
  const handleVoiceTranscript = async (transcript: string) => {
    setShowVoiceInput(false);
    if (transcript.trim()) {
      setIsSending(true);
      try {
        await onSendText(transcript);
      } finally {
        setIsSending(false);
      }
    }
  };

  const isInputDisabled = isSending || disabled;

  return (
    <div className="p-3 bg-white border-t">
      {/* EXP indicator */}
      <div className="max-w-4xl mx-auto flex items-center justify-center mb-2">
        <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
          ✨ 10 EXP / hari
        </span>
      </div>

      <div className="max-w-4xl mx-auto flex items-end gap-2">
        {isRecording ? (
          // Recording UI
          <div className="flex-1 bg-red-50 rounded-2xl border border-red-100 p-2 flex items-center justify-between animate-pulse">
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
              className="rounded-xl h-8 px-4"
            >
              <Square className="w-3 h-3 mr-2" />
              Hentikan & Kirim
            </Button>
          </div>
        ) : (
          // Text input UI
          <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all p-1.5 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ketik pesanmu disini..."
                disabled={isInputDisabled}
                rows={1}
                className="flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 resize-none px-3 py-2 text-sm min-h-[36px] max-h-[150px] overflow-y-auto"
                autoComplete="off"
              />

              {/* Mic button - shows speech-to-text panel */}
              <Button
                type="button"
                onClick={() => setShowVoiceInput(true)}
                disabled={isInputDisabled || !!input.trim()}
                size="icon"
                variant="ghost"
                className="rounded-xl w-8 h-8 shrink-0 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors mr-1"
                title="Input Suara (Speech-to-Text)"
              >
                <Keyboard className="w-4 h-4" />
              </Button>

              {/* Direct audio record button */}
              <Button
                type="button"
                onClick={startRecording}
                disabled={isInputDisabled || !!input.trim()}
                size="icon"
                variant="ghost"
                className="rounded-xl w-8 h-8 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mr-1"
                title="Rekam Audio (Kirim langsung)"
              >
                <Mic className="w-4 h-4" />
              </Button>

              {/* Send button */}
              <Button
                type="submit"
                disabled={!input.trim() || isInputDisabled}
                size="icon"
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

      {/* Voice Input Panel */}
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
