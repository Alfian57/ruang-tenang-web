import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalListItem } from "@/app/dashboard/journal/_components/JournalListItem";

const push = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
        <button className={className} onClick={onClick}>{children}</button>
    ),
}));

describe("JournalListItem", () => {
    const journal = {
        id: 10,
        title: "Refleksi Hari Ini",
        content: "<p>isi konten panjang</p>",
        preview: "",
        created_at: "2026-01-01T00:00:00Z",
        word_count: 120,
        tags: ["fokus", "kerja", "syukur", "tidur"],
        is_private: true,
        share_with_ai: true,
        mood_emoji: "😊",
        mood_label: "Bahagia",
    };

    it("navigates to detail and renders metadata", () => {
        render(
            <JournalListItem
                journal={journal as never}
                isActive
                onDelete={vi.fn()}
                onToggleAIShare={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("Refleksi Hari Ini"));
        expect(push).toHaveBeenCalledWith("/dashboard/journal/10");
        expect(screen.getByText("#fokus")).toBeInTheDocument();
        expect(screen.getByText("+1")).toBeInTheDocument();
        expect(screen.getByText("120 kata")).toBeInTheDocument();
    });

    it("executes menu actions", () => {
        const onDelete = vi.fn();
        const onToggleAIShare = vi.fn();

        render(
            <JournalListItem
                journal={journal as never}
                isActive={false}
                onDelete={onDelete}
                onToggleAIShare={onToggleAIShare}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
        expect(push).toHaveBeenCalledWith("/dashboard/journal/10/edit");

        fireEvent.click(screen.getByRole("button", { name: /Sembunyikan dari AI/i }));
        expect(onToggleAIShare).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
