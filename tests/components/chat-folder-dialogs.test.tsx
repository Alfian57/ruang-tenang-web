import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatFolderDialogs } from "@/app/dashboard/chat/_components/ChatFolderDialogs";

vi.mock("@/components/ui/dialog", () => ({
    Dialog: ({ children, open }: { children: any; open: boolean }) => (open ? <div>{children}</div> : null),
    DialogContent: ({ children }: { children: any }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: any }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: any }) => <h3>{children}</h3>,
    DialogFooter: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe("ChatFolderDialogs", () => {
    it("creates new folder through dialog", () => {
        const onCreateFolder = vi.fn();

        render(
            <ChatFolderDialogs
                newFolderDialog
                setNewFolderDialog={vi.fn()}
                editFolderDialog={null}
                setEditFolderDialog={vi.fn()}
                folderName="Belajar"
                setFolderName={vi.fn()}
                folderColor="#ef4444"
                setFolderColor={vi.fn()}
                onCreateFolder={onCreateFolder}
                onUpdateFolder={vi.fn()}
                FOLDER_COLORS={[{ name: "Red", value: "#ef4444" }]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Buat Folder/i }));
        expect(onCreateFolder).toHaveBeenCalledTimes(1);
    });

    it("updates existing folder through edit dialog", () => {
        const onUpdateFolder = vi.fn();

        render(
            <ChatFolderDialogs
                newFolderDialog={false}
                setNewFolderDialog={vi.fn()}
                editFolderDialog={{ id: 2, name: "Kerja", color: "#3b82f6" } as any}
                setEditFolderDialog={vi.fn()}
                folderName="Kerja"
                setFolderName={vi.fn()}
                folderColor="#3b82f6"
                setFolderColor={vi.fn()}
                onCreateFolder={vi.fn()}
                onUpdateFolder={onUpdateFolder}
                FOLDER_COLORS={[{ name: "Blue", value: "#3b82f6" }]}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Simpan/i }));
        expect(onUpdateFolder).toHaveBeenCalledTimes(1);
    });
});
