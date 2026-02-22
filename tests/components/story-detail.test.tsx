import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StoryDetail } from "@/components/shared/stories/StoryDetail";

vi.mock("@/utils/sanitize", () => ({
    sanitizeHtml: (value: string) => value,
}));

const share = vi.fn();

const story = {
    id: "st-1",
    title: "Perjalanan Pulih",
    content: "<p>Konten cerita panjang</p>",
    cover_image: "/cover.jpg",
    is_featured: true,
    categories: [{ id: "c-1", name: "Pemulihan", icon: "🌿" }],
    tags: ["healing", "hope"],
    has_trigger_warning: true,
    trigger_warning_text: "Membahas kecemasan",
    is_anonymous: false,
    author: {
        name: "Nadia",
        avatar: "/avatar.jpg",
        tier_name: "Emas",
        tier_color: "#f59e0b",
    },
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    view_count: 77,
    has_hearted: true,
    heart_count: 10,
    comment_count: 5,
} as any;

describe("StoryDetail", () => {
    beforeEach(() => {
        Object.defineProperty(window, "location", {
            value: { href: "https://ruang-tenang.id/stories/1" },
            writable: true,
        });
        (navigator as any).share = share;
        share.mockReset();
    });

    it("shows trigger warning before content", () => {
        render(<StoryDetail story={story} />);

        expect(screen.getByText("Peringatan Konten")).toBeInTheDocument();
        expect(screen.queryByText("Konten cerita panjang")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Saya Mengerti, Tampilkan Cerita"));
        expect(screen.getByText("Konten cerita panjang")).toBeInTheDocument();
    });

    it("handles heart and share actions", () => {
        const onHeart = vi.fn();

        render(<StoryDetail story={{ ...story, has_trigger_warning: false }} onHeart={onHeart} />);

        fireEvent.click(screen.getByText("10"));
        expect(onHeart).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("Bagikan"));
        expect(share).toHaveBeenCalledWith({
            title: "Perjalanan Pulih",
            url: "https://ruang-tenang.id/stories/1",
        });
    });
});
