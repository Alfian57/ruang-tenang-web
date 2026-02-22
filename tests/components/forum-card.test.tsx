import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ForumCard } from "@/components/shared/forum/ForumCard";

describe("ForumCard", () => {
    it("renders forum info with category and author", () => {
        const forum = {
            slug: "topik-1",
            title: "Topik Kesehatan Mental",
            content: "Isi forum",
            replies_count: 3,
            likes_count: 5,
            created_at: new Date().toISOString(),
            category: { name: "Dukungan" },
            user: { name: "Budi" },
        } as never;

        render(<ForumCard forum={forum} />);

        expect(screen.getByRole("link")).toHaveAttribute("href", "/dashboard/forum/topik-1");
        expect(screen.getByText("Topik Kesehatan Mental")).toBeInTheDocument();
        expect(screen.getByText("Dukungan")).toBeInTheDocument();
        expect(screen.getByText("Budi")).toBeInTheDocument();
    });

    it("renders fallback category and anonymous user", () => {
        const forum = {
            slug: "topik-2",
            title: "Topik Umum",
            content: "Isi",
            replies_count: 0,
            likes_count: 0,
            created_at: new Date().toISOString(),
            category: null,
            user: null,
        } as never;

        render(<ForumCard forum={forum} />);

        expect(screen.getByText("Umum")).toBeInTheDocument();
        expect(screen.getByText("Anonymous")).toBeInTheDocument();
    });
});
