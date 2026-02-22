import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InspiringStoryWidget } from "@/components/shared/gamification/InspiringStoryWidget";
import { storyService } from "@/services/api";

vi.mock("@/services/api", () => ({
    storyService: {
        getFeatured: vi.fn(),
    },
}));

describe("InspiringStoryWidget", () => {
    it("shows fallback CTA when there is no featured story", async () => {
        vi.mocked(storyService.getFeatured).mockResolvedValueOnce({ data: [] } as never);

        render(<InspiringStoryWidget />);

        await waitFor(() => {
            expect(screen.getByText("Kisah Inspiratif")).toBeInTheDocument();
            expect(screen.getByText("Jelajahi Kisah")).toBeInTheDocument();
        });
    });

    it("renders featured story data", async () => {
        vi.mocked(storyService.getFeatured).mockResolvedValueOnce({
            data: [
                {
                    id: 12,
                    title: "Bangkit dari Burnout",
                    cover_image: "/cover.jpg",
                    is_anonymous: false,
                    author: { name: "Nina" },
                    heart_count: 27,
                },
            ],
        } as never);

        render(<InspiringStoryWidget />);

        await waitFor(() => {
            expect(screen.getByText("Bangkit dari Burnout")).toBeInTheDocument();
            expect(screen.getByText("Nina")).toBeInTheDocument();
            expect(screen.getByText("27")).toBeInTheDocument();
        });
    });
});
