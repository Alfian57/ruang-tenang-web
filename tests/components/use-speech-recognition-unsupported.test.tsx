import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSpeechRecognition } from "@/app/dashboard/chat/_hooks/useSpeechRecognition";

let latestInstance: any;

class SpeechRecognitionMock {
    public continuous = false;
    public interimResults = false;
    public lang = "";
    public maxAlternatives = 0;
    public onresult: ((event: any) => void) | null = null;
    public onerror: ((event: any) => void) | null = null;
    public onend: (() => void) | null = null;

    constructor() {
        latestInstance = this;
    }

    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();
}

function Harness() {
    const hook = useSpeechRecognition();
    return (
        <div>
            <div data-testid="supported">{hook.isSupported ? "yes" : "no"}</div>
            <div data-testid="error">{hook.error ?? ""}</div>
            <button onClick={() => hook.startListening()}>start</button>
            <button onClick={() => hook.toggleListening()}>toggle</button>
        </div>
    );
}

describe("useSpeechRecognition edge cases", () => {
    it("sets unsupported state when SpeechRecognition is unavailable", () => {
        Object.defineProperty(window, "SpeechRecognition", { value: undefined, configurable: true });
        Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });

        render(<Harness />);

        expect(screen.getByTestId("supported")).toHaveTextContent("no");
        expect(screen.getByTestId("error")).toHaveTextContent("Browser tidak mendukung Speech Recognition");
    });

    it("maps recognition errors to user-friendly text", async () => {
        Object.defineProperty(window, "SpeechRecognition", { value: SpeechRecognitionMock, configurable: true });
        Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });

        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "start" }));

        latestInstance.onerror?.({ error: "not-allowed", message: "denied" });

        expect(screen.getByTestId("supported")).toHaveTextContent("yes");
        await waitFor(() => {
            expect(screen.getByTestId("error")).toHaveTextContent("Izin mikrofon ditolak");
        });
    });
});
