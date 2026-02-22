import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StoryCard, StoryList } from "@/components/shared/stories/StoryCard";

describe("StoryCard", () => {
    it("renders badges, categories, and anonymous fallback", () => {
        const story = {
            id: 99,
            title: "Perjalanan Pulih",
            excerpt: "Saya belajar menerima diri",
            cover_image: "",
            is_featured: true,
            has_trigger_warning: true,
            categories: [
                { id: 1, name: "Healing" },
                { id: 2, name: "Motivasi" },
                { id: 3, name: "Support" },
            ],
            is_anonymous: true,
            author: null,
            heart_count: 12,
            comment_count: 4,
        } as never;

        render(<StoryCard story={story} />);

        expect(screen.getByRole("link")).toHaveAttribute("href", "/stories/99");
        expect(screen.getByText("Featured")).toBeInTheDocument();
        expect(screen.getByText("TW")).toBeInTheDocument();
        expect(screen.getByText("Healing")).toBeInTheDocument();
        expect(screen.getByText("+1")).toBeInTheDocument();
        expect(screen.getByText("Anonim")).toBeInTheDocument();
    });
});

describe("StoryList", () => {
    it("renders empty state and populated list", () => {
        const { rerender } = render(<StoryList stories={[]} />);
        expect(screen.getByText("Belum Ada Cerita")).toBeInTheDocument();

        rerender(
            <StoryList
                stories={[
                    {
                        id: 1,
                        title: "Cerita 1",
                        excerpt: "A",
                        cover_image: "",
                        is_featured: false,
                        has_trigger_warning: false,
                        categories: [],
                        is_anonymous: true,
                        author: null,
                        heart_count: 0,
                        comment_count: 0,
                    },
                    {
                        id: 2,
                        title: "Cerita 2",
                        excerpt: "B",
                        cover_image: "",
                        is_featured: false,
                        has_trigger_warning: false,
                        categories: [],
                        is_anonymous: true,
                        author: null,
                        heart_count: 0,
                        comment_count: 0,
                    },
                ] as never}
            />
        );

        expect(screen.getByText("Cerita 1")).toBeInTheDocument();
        expect(screen.getByText("Cerita 2")).toBeInTheDocument();
    });
});
