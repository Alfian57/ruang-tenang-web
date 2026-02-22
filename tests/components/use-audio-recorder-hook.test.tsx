import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAudioRecorder } from "@/app/dashboard/chat/_hooks/useAudioRecorder";

let latestRecorder: any;

class MediaRecorderMock {
    public state = "inactive";
    public ondataavailable: ((event: { data: Blob }) => void) | null = null;
    public onstop: (() => void) | null = null;

    constructor(_: MediaStream) {
        latestRecorder = this;
    }

    start() {
        this.state = "recording";
    }

    stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/mp3" }) });
        this.onstop?.();
    }
}

function Harness({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => Promise<void> }) {
    const hook = useAudioRecorder({ onRecordingComplete });
    return (
        <div>
            <div data-testid="recording">{hook.isRecording ? "yes" : "no"}</div>
            <div data-testid="sending">{hook.isSending ? "yes" : "no"}</div>
            <button onClick={() => hook.startRecording()}>start</button>
            <button onClick={() => hook.stopRecording()}>stop</button>
            <span>{hook.formatRecordingTime(65)}</span>
        </div>
    );
}

describe("useAudioRecorder", () => {
    it("starts and stops recording and sends blob", async () => {
        const stopTrack = vi.fn();
        const getUserMedia = vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: stopTrack }],
        });

        Object.defineProperty(globalThis, "MediaRecorder", { value: MediaRecorderMock, configurable: true });
        Object.defineProperty(globalThis.navigator, "mediaDevices", {
            value: { getUserMedia },
            configurable: true,
        });

        const onRecordingComplete = vi.fn().mockResolvedValue(undefined);
        render(<Harness onRecordingComplete={onRecordingComplete} />);

        fireEvent.click(screen.getByRole("button", { name: "start" }));
        await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ audio: true }));
        await waitFor(() => {
            expect(screen.getByTestId("recording")).toHaveTextContent("yes");
        });
        expect(screen.getByText("1:05")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "stop" }));
        await waitFor(() => {
            expect(onRecordingComplete).toHaveBeenCalledTimes(1);
            expect(onRecordingComplete.mock.calls[0][0]).toBeInstanceOf(Blob);
            expect(stopTrack).toHaveBeenCalledTimes(1);
        });
    });
});
