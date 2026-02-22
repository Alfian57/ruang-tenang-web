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

describe("SessionItem trash mode", () => {
    it("handles restore and permanent delete actions", () => {
        const onToggleTrash = vi.fn();
        const onDeletePermanent = vi.fn();

        render(
            <SessionItem
                session={{ uuid: "sess-trash", title: "Sampah", is_favorite: false } as any}
                isActive={false}
                isTrashView
                onSelect={vi.fn()}
                onToggleFavorite={vi.fn()}
                onToggleTrash={onToggleTrash}
                onDeletePermanent={onDeletePermanent}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Pulihkan/i }));
        fireEvent.click(screen.getByRole("button", { name: /Hapus Permanen/i }));

        expect(onToggleTrash).toHaveBeenCalled();
        expect(onDeletePermanent).toHaveBeenCalled();
    });
});
