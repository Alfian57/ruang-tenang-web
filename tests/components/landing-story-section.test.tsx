import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StorySection } from "@/app/(landing)/_components/StorySection";

const getStories = vi.fn();

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/services/api", () => ({
    storyService: {
        getStories: (...args: unknown[]) => getStories(...args),
    },
}));

describe("StorySection", () => {
    it("renders fetched stories and stories CTA", async () => {
        getStories.mockResolvedValue({
            data: [
                {
                    id: "s-1",
                    title: "Bangkit dari Burnout",
                    excerpt: "cerita panjang",
                    heart_count: 12,
                    author: { name: "Nadia" },
                    published_at: "2025-01-01T00:00:00.000Z",
                },
            ],
        });

        render(<StorySection />);

        expect(await screen.findByText("Bangkit dari Burnout")).toBeInTheDocument();
        expect(screen.getByText("Nadia")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Baca Semua Cerita/i })).toHaveAttribute("href", "/stories");
    });
});
