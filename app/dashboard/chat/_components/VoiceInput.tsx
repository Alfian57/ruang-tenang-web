"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
    onTranscriptComplete: (transcript: string) => void;
    onClose: () => void;
    disabled?: boolean;
}

// Type definitions for Web Speech API
interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: ISpeechRecognitionEvent) => void) | null;
    onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

interface ISpeechRecognitionEvent {
    resultIndex: number;
    results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
    length: number;
    [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface ISpeechRecognitionErrorEvent {
    error: string;
    message: string;
}

// Extend window to include webkit-prefixed SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: new () => ISpeechRecognition;
        webkitSpeechRecognition: new () => ISpeechRecognition;
    }
}

/**
 * Voice input component using Web Speech API for real-time speech-to-text.
 * Shows live transcript that user can edit before sending.
 */
export function VoiceInput({ onTranscriptComplete, onClose, disabled = false }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Check browser support
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
                setError("Browser tidak mendukung Speech Recognition. Gunakan Chrome atau Edge.");
            }
        }
    }, []);

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        if (typeof window === "undefined") return null;

        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionClass) return null;

        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "id-ID"; // Indonesian
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
            let interim = "";
            let final = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript + " ";
                } else {
                    interim += result[0].transcript;
                }
            }

            if (final) {
                setTranscript((prev) => prev + final);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);

            switch (event.error) {
                case "not-allowed":
                    setError("Izin mikrofon ditolak. Aktifkan izin mikrofon di browser.");
                    break;
                case "no-speech":
                    // This is common, don't show error
                    break;
                case "network":
                    setError("Koneksi terputus. Periksa koneksi internet.");
                    break;
                default:
                    setError(`Error: ${event.error}`);
            }

            setIsListening(false);
        };

        recognition.onend = () => {
            // Auto restart if still in listening mode (for continuous recognition)
            if (recognitionRef.current && isListening) {
                try {
                    recognitionRef.current.start();
                } catch {
                    // Ignore - already started
                }
            }
        };

        return recognition;
    }, [isListening]);

    // Start listening
    const startListening = useCallback(() => {
        setError(null);
        const recognition = initRecognition();
        if (!recognition) return;

        recognitionRef.current = recognition;

        try {
            recognition.start();
            setIsListening(true);
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setError("Gagal memulai pengenalan suara");
        }
    }, [initRecognition]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimTranscript("");
    }, []);

    // Toggle listening
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Submit transcript
    const handleSubmit = () => {
        const finalText = transcript.trim();
        if (finalText) {
            onTranscriptComplete(finalText);
        }
        onClose();
    };

    // Cancel and close
    const handleCancel = () => {
        stopListening();
        onClose();
    };

    // Auto-start listening when component mounts
    useEffect(() => {
        if (isSupported && !disabled) {
            startListening();
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [transcript, interimTranscript]);

    if (!isSupported) {
        return (
            <div className="fixed inset-x-0 bottom-0 p-4 bg-white border-t shadow-lg z-50">
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
        <div className="fixed inset-x-0 bottom-0 p-4 bg-white border-t shadow-lg z-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {isListening ? (
                            <>
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm text-red-600 font-medium">Mendengarkan...</span>
                            </>
                        ) : (
                            <>
                                <MicOff className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Mikrofon dimatikan</span>
                            </>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="h-8 w-8"
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
                            // Allow editing but only the final transcript part
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
                            disabled={!transcript.trim()}
                            className="gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Kirim
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <p className="text-xs text-gray-400 text-center mt-3">
                    Tip: Anda dapat mengedit teks sebelum mengirim
                </p>
            </div>
        </div>
    );
}
