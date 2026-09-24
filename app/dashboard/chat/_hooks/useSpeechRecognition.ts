import { useState, useEffect, useRef, useCallback } from "react";

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

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const shouldListenRef = useRef(false);

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
                    shouldListenRef.current = false;
                    break;
                case "no-speech":
                    break;
                case "network":
                    setError("Koneksi terputus. Periksa koneksi internet.");
                    shouldListenRef.current = false;
                    break;
                default:
                    setError(`Error: ${event.error}`);
                    shouldListenRef.current = false;
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            if (recognitionRef.current === recognition && shouldListenRef.current) {
                try {
                    recognition.start();
                    setIsListening(true);
                } catch {
                    shouldListenRef.current = false;
                    recognitionRef.current = null;
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };

        return recognition;
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && shouldListenRef.current) return;
        setError(null);
        const recognition = initRecognition();
        if (!recognition) {
            setIsSupported(false);
            setError("Browser tidak mendukung pengenalan suara.");
            return;
        }

        recognitionRef.current = recognition;

        try {
            recognition.start();
            shouldListenRef.current = true;
            setIsListening(true);
        } catch (err) {
            recognitionRef.current = null;
            console.error("Failed to start recognition:", err);
            setError("Gagal memulai pengenalan suara");
        }
    }, [initRecognition]);

    const stopListening = useCallback(() => {
        shouldListenRef.current = false;
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimTranscript("");
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
        setInterimTranscript("");
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        error,
        startListening,
        stopListening,
        toggleListening,
        setTranscript, // Allow manual editing
        resetTranscript
    };
}
