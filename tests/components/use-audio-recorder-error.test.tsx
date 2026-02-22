import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAudioRecorder } from "@/app/dashboard/chat/_hooks/useAudioRecorder";

const toastError = vi.fn();

vi.mock("sonner", () => ({
    toast: {
        error: (...args: unknown[]) => toastError(...args),
    },
}));

function Harness() {
    const hook = useAudioRecorder({ onRecordingComplete: vi.fn().mockResolvedValue(undefined) });
    return <button onClick={() => hook.startRecording()}>start</button>;
}

describe("useAudioRecorder error", () => {
    it("shows toast when microphone access fails", async () => {
        Object.defineProperty(globalThis.navigator, "mediaDevices", {
            value: {
                getUserMedia: vi.fn().mockRejectedValue(new Error("permission denied")),
            },
            configurable: true,
        });

        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "start" }));

        await waitFor(() => {
            expect(toastError).toHaveBeenCalledWith(
                "Gagal mengakses mikrofon",
                expect.objectContaining({
                    description: "Pastikan izin mikrofon telah diberikan di pengaturan browser.",
                })
            );
        });
    });
});
