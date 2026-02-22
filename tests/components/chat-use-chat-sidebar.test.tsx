import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChatSidebar } from "@/app/dashboard/chat/_hooks/useChatSidebar";

function HookHarness({
    onCreateFolder,
    onUpdateFolder,
}: {
    onCreateFolder: (name: string, color?: string) => void;
    onUpdateFolder: (folderId: number, data: { name?: string; color?: string }) => void;
}) {
    const hook = useChatSidebar({ onCreateFolder, onUpdateFolder });

    return (
        <div>
            <div data-testid="name">{hook.newFolderName}</div>
            <div data-testid="color">{hook.newFolderColor}</div>
            <div data-testid="expanded">{hook.expandedFolders.has(5) ? "yes" : "no"}</div>
            <div data-testid="dialog-open">{String(hook.newFolderDialog)}</div>
            <button onClick={() => hook.setNewFolderName("  Fokus  ")}>Set Name</button>
            <button onClick={() => hook.setNewFolderDialog(true)}>Open Dialog</button>
            <button onClick={() => hook.handleCreateFolder()}>Create Folder</button>
            <button
                onClick={() =>
                    hook.openEditFolder({
                        id: 8,
                        uuid: "f-8",
                        name: "Kerja",
                        color: "#10b981",
                        icon: "folder",
                        position: 1,
                        session_count: 0,
                        created_at: "2026-01-01",
                    })
                }
            >
                Open Edit
            </button>
            <button onClick={() => hook.setNewFolderName("Baru")}>Set Edit Name</button>
            <button onClick={() => hook.handleUpdateFolder()}>Update Folder</button>
            <button onClick={() => hook.toggleFolderExpand(5)}>Toggle Expand</button>
        </div>
    );
}

describe("useChatSidebar", () => {
    it("creates folder and resets state", () => {
        const onCreateFolder = vi.fn();
        const onUpdateFolder = vi.fn();

        render(<HookHarness onCreateFolder={onCreateFolder} onUpdateFolder={onUpdateFolder} />);

        fireEvent.click(screen.getByRole("button", { name: "Open Dialog" }));
        expect(screen.getByTestId("dialog-open")).toHaveTextContent("true");

        fireEvent.click(screen.getByRole("button", { name: "Set Name" }));
        fireEvent.click(screen.getByRole("button", { name: "Create Folder" }));

        expect(onCreateFolder).toHaveBeenCalledWith("Fokus", "#6366f1");
        expect(screen.getByTestId("name")).toHaveTextContent("");
    });

    it("updates folder and toggles expanded folder state", () => {
        const onCreateFolder = vi.fn();
        const onUpdateFolder = vi.fn();

        render(<HookHarness onCreateFolder={onCreateFolder} onUpdateFolder={onUpdateFolder} />);

        fireEvent.click(screen.getByRole("button", { name: "Open Edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Set Edit Name" }));
        fireEvent.click(screen.getByRole("button", { name: "Update Folder" }));

        expect(onUpdateFolder).toHaveBeenCalledWith(8, { name: "Baru", color: "#10b981" });

        fireEvent.click(screen.getByRole("button", { name: "Toggle Expand" }));
        expect(screen.getByTestId("expanded")).toHaveTextContent("yes");
    });
});
