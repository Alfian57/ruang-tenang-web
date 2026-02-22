import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionItem } from "@/app/dashboard/chat/_components/SessionItem";

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: any; onClick?: (e: any) => void }) => (
        <button onClick={(e) => onClick?.(e)}>{children}</button>
    ),
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuSub: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuSubTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuSubContent: ({ children }: { children: any }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
    TooltipProvider: ({ children }: { children: any }) => <div>{children}</div>,
    Tooltip: ({ children }: { children: any }) => <div>{children}</div>,
    TooltipTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    TooltipContent: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe("SessionItem", () => {
    it("renders session title and handles selection", () => {
        const onSelect = vi.fn();

        render(
            <SessionItem
                session={{
                    uuid: "sess-1",
                    title: "Sesi Pagi",
                    is_favorite: true,
                    has_summary: true,
                    last_message: "Halo",
                } as any}
                isActive
                isTrashView={false}
                onSelect={onSelect}
                onToggleFavorite={vi.fn()}
                onToggleTrash={vi.fn()}
            />
        );

        fireEvent.click(screen.getAllByText("Sesi Pagi")[0]);
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(screen.getByText("📝")).toBeInTheDocument();
    });

    it("handles favorite and trash actions", () => {
        const onToggleFavorite = vi.fn();
        const onToggleTrash = vi.fn();

        render(
            <SessionItem
                session={{
                    uuid: "sess-2",
                    title: "Sesi Malam",
                    is_favorite: false,
                    has_summary: false,
                } as any}
                isActive={false}
                isTrashView={false}
                onSelect={vi.fn()}
                onToggleFavorite={onToggleFavorite}
                onToggleTrash={onToggleTrash}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Favorit/i }));
        fireEvent.click(screen.getByRole("button", { name: /Pindahkan ke Sampah/i }));

        expect(onToggleFavorite).toHaveBeenCalled();
        expect(onToggleTrash).toHaveBeenCalled();
    });
});
