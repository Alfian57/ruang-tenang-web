import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatInput } from "@/app/dashboard/chat/_components/ChatInput";

const recorderState = {
    isRecording: false,
    recordingDuration: 0,
    isSending: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    formatRecordingTime: vi.fn().mockReturnValue("0:10"),
};

vi.mock("@/app/dashboard/chat/_hooks/useAudioRecorder", () => ({
    useAudioRecorder: () => recorderState,
}));

vi.mock("@/app/dashboard/chat/_components/VoiceInput", () => ({
    VoiceInput: ({ onTranscriptComplete }: { onTranscriptComplete: (t: string) => void }) => (
        <button onClick={() => onTranscriptComplete("teks dari suara")}>Mock Voice Input</button>
    ),
}));

describe("ChatInput", () => {
    it("sends typed text", async () => {
        const onSendText = vi.fn().mockResolvedValue(undefined);

        render(<ChatInput onSendText={onSendText} onSendAudio={vi.fn()} />);

        fireEvent.change(screen.getByPlaceholderText("Ketik pesanmu disini..."), {
            target: { value: "halo ai" },
        });
        fireEvent.click(screen.getByRole("button", { name: "" }));

        await waitFor(() => expect(onSendText).toHaveBeenCalledWith("halo ai"));
    });

    it("uses voice transcript flow", async () => {
        const onSendText = vi.fn().mockResolvedValue(undefined);

        render(<ChatInput onSendText={onSendText} onSendAudio={vi.fn()} />);

        const keyboardButton = screen.getByTitle("Input Suara (Speech-to-Text)");
        fireEvent.click(keyboardButton);

        fireEvent.click(screen.getByRole("button", { name: "Mock Voice Input" }));
        await waitFor(() => expect(onSendText).toHaveBeenCalledWith("teks dari suara"));
    });
});
