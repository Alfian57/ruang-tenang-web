import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSidebarFolderList } from "@/app/dashboard/chat/_components/ChatSidebarFolderList";

vi.mock("@/app/dashboard/chat/_components/SessionItem", () => ({
    SessionItem: ({ session, onSelect }: { session: { title: string }; onSelect: () => void }) => (
        <button onClick={onSelect}>Folder Session: {session.title}</button>
    ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

describe("ChatSidebarFolderList", () => {
    const folder = {
        id: 10,
        uuid: "folder-10",
        name: "Kerja",
        color: "#6366f1",
        icon: "folder",
        position: 1,
        session_count: 1,
        created_at: "2026-01-01",
    };

    const baseProps = {
        folders: [folder],
        sessionsByFolder: {
            10: [
                {
                    id: 1,
                    uuid: "sess-1",
                    user_id: 1,
                    title: "Sesi Folder",
                    is_favorite: false,
                    is_trash: false,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                },
            ],
        },
        expandedFolders: new Set<number>([10]),
        activeFolderId: null,
        activeSessionId: null,
        isCollapsed: false,
        onToggleCollapse: vi.fn(),
        onToggleExpand: vi.fn(),
        onFolderSelect: vi.fn(),
        onSessionSelect: vi.fn(),
        onClose: vi.fn(),
        onToggleFavorite: vi.fn(),
        onToggleTrash: vi.fn(),
        onMoveToFolder: vi.fn(),
        openEditFolder: vi.fn(),
        onDeleteFolder: vi.fn(),
    };

    it("renders folder section and folder session", () => {
        render(<ChatSidebarFolderList {...baseProps} />);

        expect(screen.getByText("Folder")).toBeInTheDocument();
        expect(screen.getByText("Kerja")).toBeInTheDocument();
        expect(screen.getByText("Folder Session: Sesi Folder")).toBeInTheDocument();
    });

    it("handles folder selection and collapse toggle", () => {
        render(<ChatSidebarFolderList {...baseProps} />);

        fireEvent.click(screen.getAllByRole("button", { name: /Folder/i })[0]);
        expect(baseProps.onToggleCollapse).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("Kerja"));
        expect(baseProps.onFolderSelect).toHaveBeenCalledWith(10);
    });

    it("calls edit and delete folder actions", () => {
        render(<ChatSidebarFolderList {...baseProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
        expect(baseProps.openEditFolder).toHaveBeenCalledWith(folder);

        fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
        expect(baseProps.onDeleteFolder).toHaveBeenCalledWith(10);
    });
});
