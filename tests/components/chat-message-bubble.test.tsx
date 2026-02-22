import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ChatMessageBubble } from "@/app/dashboard/chat/_components/ChatMessageBubble";

vi.mock("@/app/dashboard/chat/_components/AudioPlayer", () => ({
    AudioPlayer: ({ src }: { src: string }) => <div>Audio: {src}</div>,
}));

beforeAll(() => {
    Object.assign(navigator, {
        clipboard: {
            writeText: vi.fn(),
        },
    });
});

describe("ChatMessageBubble", () => {
    it("renders AI text message and handles actions", () => {
        const onToggleLike = vi.fn();
        const onTogglePin = vi.fn();

        render(
            <ChatMessageBubble
                message={{
                    id: 1,
                    role: "assistant",
                    type: "text",
                    content: "Lihat **ini** [tautan](https://example.com)",
                    created_at: new Date().toISOString(),
                    is_pinned: true,
                    is_liked: false,
                    is_disliked: false,
                } as any}
                onToggleLike={onToggleLike}
                onTogglePin={onTogglePin}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Sematkan/i }));
        fireEvent.click(document.querySelector('button[title="Like"]') as HTMLButtonElement);
        fireEvent.click(document.querySelector('button[title="Dislike"]') as HTMLButtonElement);

        expect(onTogglePin).toHaveBeenCalledWith(1);
        expect(onToggleLike).toHaveBeenCalledWith(1, true);
        expect(onToggleLike).toHaveBeenCalledWith(1, false);
        expect(screen.getByRole("link", { name: "tautan" })).toHaveAttribute("href", "https://example.com");
    });

    it("renders user audio message", () => {
        render(
            <ChatMessageBubble
                message={{
                    id: 2,
                    role: "user",
                    type: "audio",
                    content: "/audio.mp3",
                    created_at: new Date().toISOString(),
                } as any}
                userName="Alfi"
                onToggleLike={vi.fn()}
            />
        );

        expect(screen.getByText("Audio: /audio.mp3")).toBeInTheDocument();
    });
});
