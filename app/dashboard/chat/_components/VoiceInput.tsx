"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useSpeechRecognition } from "../_hooks/useSpeechRecognition";

interface VoiceInputProps {
    onTranscriptComplete: (transcript: string) => Promise<boolean>;
    onClose: () => void;
    disabled?: boolean;
}

export function VoiceInput({ onTranscriptComplete, onClose, disabled = false }: VoiceInputProps) {
    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        error,
        startListening,
        stopListening,
        toggleListening,
        setTranscript,
    } = useSpeechRecognition();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-start listening on mount
    useEffect(() => {
        if (isSupported && !disabled) {
            startListening();
        }
        return () => {
            stopListening();
        };
    }, [isSupported, disabled, startListening, stopListening]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [transcript, interimTranscript]);

    const handleSubmit = async () => {
        const finalText = transcript.trim();
        if (!finalText || isSubmitting) return;
        stopListening();
        setIsSubmitting(true);
        try {
            const sent = await onTranscriptComplete(finalText);
            if (sent) onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        stopListening();
        onClose();
    };

    if (!isSupported) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-rose-100 bg-white p-4 shadow-2xl" role="dialog" aria-modal="true" aria-label="Dikte suara">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-red-500 text-sm mb-2">{error}</p>
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-rose-100 bg-[#fffaf8] p-4 shadow-[0_-20px_60px_-25px_rgba(105,44,49,0.3)]" role="dialog" aria-modal="true" aria-label="Dikte suara">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100">
                            <Image src="/images/dashboard/mascot/chat-listen.webp" alt="RuNa" width={44} height={44} className="h-10 w-10 object-contain" />
                        </div>
                        <div>
                        <p className="text-xs font-semibold text-slate-800">Bicara dengan RuNa</p>
                        <div className="flex items-center gap-1.5">
                        {isListening ? (
                            <>
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm text-red-600 font-medium">Mendengarkan...</span>
                            </>
                        ) : (
                            <>
                                <MicOff className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Mikrofon dimatikan</span>
                            </>
                        )}
                        </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="h-8 w-8"
                        aria-label="Tutup dikte suara"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-red-500 text-sm mb-2 text-center">
                        {error}
                    </div>
                )}

                {/* Transcript area */}
                <div className="relative mb-3">
                    <textarea
                        ref={textareaRef}
                        value={transcript + interimTranscript}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            if (!interimTranscript) {
                                setTranscript(newValue);
                            }
                        }}
                        placeholder={isListening ? "Mulai berbicara..." : "Klik mikrofon untuk mulai"}
                        className={cn(
                            "w-full p-3 rounded-xl border bg-gray-50 text-sm resize-none min-h-[60px] max-h-[200px]",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                            isListening && "border-red-200 bg-red-50/30"
                        )}
                        rows={2}
                        readOnly={Boolean(interimTranscript)}
                    />

                    {/* Interim text indicator */}
                    {interimTranscript && (
                        <div className="absolute bottom-2 right-2">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                    <Button
                        variant={isListening ? "destructive" : "outline"}
                        size="sm"
                        onClick={toggleListening}
                        className="gap-2"
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-4 h-4" />
                                Hentikan
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4" />
                                Mulai Rekam
                            </>
                        )}
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!transcript.trim() || isSubmitting}
                            className="gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {isSubmitting ? "Mengirim..." : "Kirim"}
                        </Button>
                    </div>
                </div>

                <p className="mt-3 text-center text-xs text-slate-500">
                    Suaramu diubah menjadi teks agar RuNa bisa merespons. Kamu dapat mengeditnya sebelum mengirim.
                </p>
            </div>
        </div>
    );
}
