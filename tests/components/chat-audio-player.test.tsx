import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AudioPlayer } from "@/app/dashboard/chat/_components/AudioPlayer";

vi.mock("@/services/http/upload-url", () => ({
    getUploadUrl: (src: string) => `https://cdn.local/${src}`,
}));

beforeAll(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
        configurable: true,
        value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
        configurable: true,
        value: vi.fn(),
    });
});

describe("AudioPlayer", () => {
    it("toggles play and pause buttons", () => {
        render(<AudioPlayer src="audio/test.mp3" />);

        const playButton = screen.getByRole("button", { name: "Play" });
        fireEvent.click(playButton);
        expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Pause" }));
        expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });

    it("renders inverted style variant", () => {
        const { container } = render(<AudioPlayer src="audio/test.mp3" inverted />);

        expect(container.firstChild).toHaveClass("bg-white/20");
    });
});
