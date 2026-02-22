import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArticleSection } from "@/app/(landing)/_components/ArticleSection";

const getArticles = vi.fn();

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/services/api", () => ({
    articleService: {
        getArticles: (...args: unknown[]) => getArticles(...args),
    },
}));

describe("ArticleSection", () => {
    it("renders fetched articles and list CTA", async () => {
        getArticles.mockResolvedValue({
            data: [
                {
                    id: 1,
                    slug: "cara-tenang",
                    title: "Cara Menenangkan Pikiran",
                    thumbnail: "/thumb.jpg",
                    content: "isi konten",
                    excerpt: "ringkasan",
                    created_at: "2025-01-01T00:00:00.000Z",
                    category: { id: 1, name: "Mental" },
                },
            ],
        });

        render(<ArticleSection />);

        expect(await screen.findByText("Cara Menenangkan Pikiran")).toBeInTheDocument();
        expect(screen.getByText("Mental")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Lihat Semua Artikel/i })).toHaveAttribute("href", "/articles");
    });

    it("renders nothing when no article data", async () => {
        getArticles.mockResolvedValue({ data: [] });

        const { container } = render(<ArticleSection />);

        await waitFor(() => expect(getArticles).toHaveBeenCalled());
        expect(container).toBeEmptyDOMElement();
    });
});
