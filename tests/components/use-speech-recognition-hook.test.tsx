import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSpeechRecognition } from "@/app/dashboard/chat/_hooks/useSpeechRecognition";

let recognitionInstance: any;

class SpeechRecognitionMock {
    public continuous = false;
    public interimResults = false;
    public lang = "";
    public maxAlternatives = 0;
    public onresult: ((event: any) => void) | null = null;
    public onerror: ((event: any) => void) | null = null;
    public onend: (() => void) | null = null;

    constructor() {
        recognitionInstance = this;
    }

    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();
}

function Harness() {
    const hook = useSpeechRecognition();
    return (
        <div>
            <div data-testid="listening">{hook.isListening ? "yes" : "no"}</div>
            <div data-testid="transcript">{hook.transcript}</div>
            <div data-testid="interim">{hook.interimTranscript}</div>
            <button onClick={() => hook.startListening()}>start</button>
            <button onClick={() => hook.stopListening()}>stop</button>
            <button onClick={() => hook.toggleListening()}>toggle</button>
            <button onClick={() => hook.resetTranscript()}>reset</button>
        </div>
    );
}

describe("useSpeechRecognition", () => {
    it("starts, processes result, and stops listening", async () => {
        Object.defineProperty(window, "SpeechRecognition", {
            value: SpeechRecognitionMock,
            configurable: true,
        });
        Object.defineProperty(window, "webkitSpeechRecognition", {
            value: undefined,
            configurable: true,
        });

        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "start" }));
        expect(recognitionInstance.start).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("listening")).toHaveTextContent("yes");

        recognitionInstance.onresult?.({
            resultIndex: 0,
            results: [
                { isFinal: false, 0: { transcript: "halo int", confidence: 0.8 } },
            ],
        });

        await waitFor(() => {
            expect(screen.getByTestId("interim")).toHaveTextContent("halo int");
        });

        recognitionInstance.onresult?.({
            resultIndex: 0,
            results: [{ isFinal: true, 0: { transcript: "halo final", confidence: 0.9 } }],
        });

        await waitFor(() => {
            expect(screen.getByTestId("transcript")).toHaveTextContent("halo final");
        });

        fireEvent.click(screen.getByRole("button", { name: "stop" }));
        expect(recognitionInstance.stop).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("listening")).toHaveTextContent("no");

        fireEvent.click(screen.getByRole("button", { name: "reset" }));
        expect(screen.getByTestId("transcript")).toHaveTextContent("");
    });
});
