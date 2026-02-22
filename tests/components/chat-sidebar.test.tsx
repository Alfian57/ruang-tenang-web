import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSidebar } from "@/app/dashboard/chat/_components/ChatSidebar";

const useChatSidebarState = {
    newFolderDialog: false,
    setNewFolderDialog: vi.fn(),
    editFolderDialog: null,
    setEditFolderDialog: vi.fn(),
    newFolderName: "",
    setNewFolderName: vi.fn(),
    newFolderColor: "#6366f1",
    setNewFolderColor: vi.fn(),
    expandedFolders: new Set<number>(),
    toggleFolderExpand: vi.fn(),
    isFolderSectionCollapsed: false,
    setIsFolderSectionCollapsed: vi.fn(),
    isUnassignedSectionCollapsed: false,
    setIsUnassignedSectionCollapsed: vi.fn(),
    handleCreateFolder: vi.fn(),
    handleUpdateFolder: vi.fn(),
    openEditFolder: vi.fn(),
    FOLDER_COLORS: [{ name: "Indigo", value: "#6366f1" }],
};

vi.mock("@/app/dashboard/chat/_hooks/useChatSidebar", () => ({
    useChatSidebar: () => useChatSidebarState,
}));

vi.mock("@/app/dashboard/chat/_components/ChatSidebarHeader", () => ({
    ChatSidebarHeader: ({ onCreateSession, onCreateFolder }: { onCreateSession: () => void; onCreateFolder: () => void }) => (
        <div>
            <button onClick={onCreateSession}>Header Create Session</button>
            <button onClick={onCreateFolder}>Header Create Folder</button>
        </div>
    ),
}));

vi.mock("@/app/dashboard/chat/_components/ChatSidebarFilter", () => ({
    ChatSidebarFilter: ({ onFilterChange }: { onFilterChange: (f: "all" | "favorites" | "trash") => void }) => (
        <button onClick={() => onFilterChange("favorites")}>Filter Favorites</button>
    ),
}));

vi.mock("@/app/dashboard/chat/_components/ChatSidebarFolderList", () => ({
    ChatSidebarFolderList: () => <div>Folder List Mock</div>,
}));

vi.mock("@/app/dashboard/chat/_components/ChatSidebarSessionList", () => ({
    ChatSidebarSessionList: () => <div>Session List Mock</div>,
}));

vi.mock("@/app/dashboard/chat/_components/ChatFolderDialogs", () => ({
    ChatFolderDialogs: () => <div>Folder Dialogs Mock</div>,
}));

describe("ChatSidebar", () => {
    const baseProps = {
        sessions: [
            {
                id: 1,
                uuid: "s-1",
                user_id: 1,
                title: "Session 1",
                is_favorite: false,
                is_trash: false,
                created_at: "2026-01-01",
                updated_at: "2026-01-01",
            },
        ],
        activeSessionId: null,
        filter: "all" as const,
        folders: [
            {
                id: 10,
                uuid: "f-10",
                name: "Folder 10",
                color: "#6366f1",
                icon: "folder",
                position: 1,
                session_count: 1,
                created_at: "2026-01-01",
            },
        ],
        activeFolderId: null,
        onFilterChange: vi.fn(),
        onSessionSelect: vi.fn(),
        onCreateSession: vi.fn(),
        onToggleFavorite: vi.fn(),
        onToggleTrash: vi.fn(),
        onDeletePermanent: vi.fn(),
        onCreateFolder: vi.fn(),
        onUpdateFolder: vi.fn(),
        onDeleteFolder: vi.fn(),
        onMoveToFolder: vi.fn(),
        onFolderSelect: vi.fn(),
        isOpen: true,
        onClose: vi.fn(),
    };

    it("renders composite sections and handles overlay close", () => {
        render(<ChatSidebar {...baseProps} />);

        expect(screen.getByText("Folder List Mock")).toBeInTheDocument();
        expect(screen.getByText("Session List Mock")).toBeInTheDocument();
        expect(screen.getByText("Folder Dialogs Mock")).toBeInTheDocument();

        const overlay = document.querySelector(".fixed.inset-0.bg-black\\/50");
        expect(overlay).toBeTruthy();
        fireEvent.click(overlay as Element);

        expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("hides session list when unassigned section is collapsed", () => {
        useChatSidebarState.isUnassignedSectionCollapsed = true;

        render(<ChatSidebar {...baseProps} />);
        expect(screen.queryByText("Session List Mock")).not.toBeInTheDocument();

        useChatSidebarState.isUnassignedSectionCollapsed = false;
    });
});
