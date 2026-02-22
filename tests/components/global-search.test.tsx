import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalSearch } from "@/components/layout/dashboard/GlobalSearch";

const push = vi.fn();
const search = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

vi.mock("@/services/api", () => ({
    searchService: {
        search: (...args: unknown[]) => search(...args),
    },
}));

vi.mock("@/services/http/upload-url", () => ({
    getUploadUrl: (path: string) => `https://cdn.local/${path}`,
}));

describe("GlobalSearch", () => {
    beforeEach(() => {
        push.mockReset();
        search.mockReset();
    });

    it("shows search results and navigates to selected article", async () => {
        search.mockResolvedValue({
            data: {
                articles: [{ id: "a-1", title: "Artikel Tes", thumbnail: "a.jpg", category: { name: "Mindset" } }],
                songs: [{ id: "s-1", title: "Lagu Tes", thumbnail: "s.jpg", category: { name: "Focus" } }],
            },
        });

        render(<GlobalSearch />);

        fireEvent.change(screen.getByPlaceholderText("Cari artikel, lagu..."), {
            target: { value: "tes" },
        });

        await waitFor(() => expect(search).toHaveBeenCalledWith("tes"));
        expect(screen.getByText("Artikel")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Artikel Tes"));
        expect(push).toHaveBeenCalledWith("/dashboard/articles/a-1");
        expect(screen.getByPlaceholderText("Cari artikel, lagu...")).toHaveValue("");
    });

    it("shows empty state when no result", async () => {
        search.mockResolvedValue({ data: { articles: [], songs: [] } });

        render(<GlobalSearch />);

        fireEvent.change(screen.getByPlaceholderText("Cari artikel, lagu..."), {
            target: { value: "kosong" },
        });

        await waitFor(() => expect(search).toHaveBeenCalledWith("kosong"));
        expect(screen.getByText("Tidak ada hasil ditemukan")).toBeInTheDocument();
    });
});
