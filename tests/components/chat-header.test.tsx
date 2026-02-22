import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatHeader } from "@/app/dashboard/chat/_components/ChatHeader";

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: any; onClick?: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

describe("ChatHeader", () => {
    it("shows summary toggle and handles export", () => {
        const onToggleSummary = vi.fn();
        const onExport = vi.fn();

        render(
            <ChatHeader
                activeSession={{ title: "Topik Kecemasan" } as any}
                messageCount={6}
                pinnedCount={0}
                showSummary={false}
                onToggleSummary={onToggleSummary}
                onExport={onExport}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Ringkasan/i }));
        expect(onToggleSummary).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /Export sebagai PDF/i }));
        fireEvent.click(screen.getByRole("button", { name: /Export sebagai TXT/i }));
        expect(onExport).toHaveBeenCalledWith("pdf");
        expect(onExport).toHaveBeenCalledWith("txt");
    }, 10000);

    it("shows pinned counter and mobile sidebar action", () => {
        const onOpenMobileSidebar = vi.fn();

        render(
            <ChatHeader
                activeSession={{ title: "Sesi" } as any}
                messageCount={2}
                pinnedCount={3}
                showSummary={false}
                onToggleSummary={vi.fn()}
                onOpenMobileSidebar={onOpenMobileSidebar}
            />
        );

        expect(screen.getByText("3")).toBeInTheDocument();
        const mobileButton = document.querySelector("button.lg\\:hidden") as HTMLButtonElement;
        fireEvent.click(mobileButton);
        expect(onOpenMobileSidebar).toHaveBeenCalled();
    });
});
