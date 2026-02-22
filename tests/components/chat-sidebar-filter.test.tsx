import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSidebarFilter } from "@/app/dashboard/chat/_components/ChatSidebarFilter";

describe("ChatSidebarFilter", () => {
    it("calls onFilterChange and clears active folder", () => {
        const onFilterChange = vi.fn();
        const onClearActiveFolder = vi.fn();

        render(
            <ChatSidebarFilter
                filter="all"
                activeFolderId={12}
                onFilterChange={onFilterChange}
                onClearActiveFolder={onClearActiveFolder}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Favorit/i }));

        expect(onFilterChange).toHaveBeenCalledWith("favorites");
        expect(onClearActiveFolder).toHaveBeenCalledTimes(1);
    });

    it("highlights active filter when no folder selected", () => {
        render(
            <ChatSidebarFilter
                filter="trash"
                activeFolderId={null}
                onFilterChange={vi.fn()}
            />
        );

        const trashButton = screen.getByRole("button", { name: /Sampah/i });
        expect(trashButton.className).toContain("bg-red-50");
    });
});
