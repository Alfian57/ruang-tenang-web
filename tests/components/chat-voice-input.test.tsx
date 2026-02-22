import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VoiceInput } from "@/app/dashboard/chat/_components/VoiceInput";

const speechState = {
    isListening: true,
    transcript: "saya merasa cemas",
    interimTranscript: "",
    isSupported: true,
    error: null as string | null,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    toggleListening: vi.fn(),
    setTranscript: vi.fn(),
};

vi.mock("@/app/dashboard/chat/_hooks/useSpeechRecognition", () => ({
    useSpeechRecognition: () => speechState,
}));

describe("VoiceInput", () => {
    it("submits transcript and closes", () => {
        const onTranscriptComplete = vi.fn();
        const onClose = vi.fn();

        render(
            <VoiceInput
                onTranscriptComplete={onTranscriptComplete}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Kirim/i }));

        expect(onTranscriptComplete).toHaveBeenCalledWith("saya merasa cemas");
        expect(onClose).toHaveBeenCalled();
    });

    it("renders unsupported browser state", () => {
        speechState.isSupported = false;
        speechState.error = "Browser tidak mendukung";

        render(<VoiceInput onTranscriptComplete={vi.fn()} onClose={vi.fn()} />);

        expect(screen.getByText("Browser tidak mendukung")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Tutup" })).toBeInTheDocument();

        speechState.isSupported = true;
        speechState.error = null;
    });
});
