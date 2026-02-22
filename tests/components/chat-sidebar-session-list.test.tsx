import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSidebarSessionList } from "@/app/dashboard/chat/_components/ChatSidebarSessionList";

vi.mock("@/app/dashboard/chat/_components/SessionItem", () => ({
    SessionItem: ({ session, onSelect }: { session: { title: string }; onSelect: () => void }) => (
        <button onClick={onSelect}>Session: {session.title}</button>
    ),
}));

describe("ChatSidebarSessionList", () => {
    const baseProps = {
        folders: [],
        filter: "all" as const,
        activeFolderId: null,
        activeSessionId: null,
        isCollapsed: false,
        onToggleCollapse: vi.fn(),
        onSessionSelect: vi.fn(),
        onClose: vi.fn(),
        onToggleFavorite: vi.fn(),
        onToggleTrash: vi.fn(),
        onDeletePermanent: vi.fn(),
        onMoveToFolder: vi.fn(),
    };

    it("renders empty state message", () => {
        render(<ChatSidebarSessionList {...baseProps} sessions={[]} />);
        expect(screen.getByText("Belum ada percakapan")).toBeInTheDocument();
    });

    it("shows unassigned header and toggles collapse", () => {
        render(
            <ChatSidebarSessionList
                {...baseProps}
                folders={[
                    {
                        id: 1,
                        uuid: "folder-1",
                        name: "Folder",
                        color: "#f43f5e",
                        icon: "folder",
                        position: 1,
                        session_count: 1,
                        created_at: "2026-01-01",
                    },
                ]}
                sessions={[
                    {
                        id: 1,
                        uuid: "sess-1",
                        user_id: 1,
                        title: "Sesi A",
                        is_favorite: false,
                        is_trash: false,
                        created_at: "2026-01-01",
                        updated_at: "2026-01-01",
                    },
                ]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Chat Lainnya/i }));
        expect(baseProps.onToggleCollapse).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Session: Sesi A")).toBeInTheDocument();
    });

    it("selects session and closes sidebar", () => {
        render(
            <ChatSidebarSessionList
                {...baseProps}
                sessions={[
                    {
                        id: 7,
                        uuid: "sess-7",
                        user_id: 1,
                        title: "Sesi Pilih",
                        is_favorite: false,
                        is_trash: false,
                        created_at: "2026-01-01",
                        updated_at: "2026-01-01",
                    },
                ]}
            />
        );

        fireEvent.click(screen.getByText("Session: Sesi Pilih"));
        expect(baseProps.onSessionSelect).toHaveBeenCalledWith("sess-7");
        expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });
});
