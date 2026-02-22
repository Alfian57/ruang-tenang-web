import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NewSessionDialog } from "@/app/dashboard/chat/_components/NewSessionDialog";

vi.mock("@/components/ui/dialog", () => ({
    Dialog: ({ children }: { children: any }) => <div>{children}</div>,
    DialogContent: ({ children }: { children: any }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: any }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: any }) => <h2>{children}</h2>,
    DialogFooter: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe("NewSessionDialog", () => {
    it("creates session and closes dialog", async () => {
        const onOpenChange = vi.fn();
        const onCreateSession = vi.fn().mockResolvedValue(undefined);

        render(
            <NewSessionDialog
                open
                onOpenChange={onOpenChange}
                onCreateSession={onCreateSession}
            />
        );

        fireEvent.change(screen.getByPlaceholderText(/Berikan judul topik/i), {
            target: { value: "Topik cemas ujian" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Mulai Chat/i }));

        await waitFor(() => expect(onCreateSession).toHaveBeenCalledWith("Topik cemas ujian"));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("disables submit when title is empty", () => {
        render(
            <NewSessionDialog
                open
                onOpenChange={vi.fn()}
                onCreateSession={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /Mulai Chat/i })).toBeDisabled();
    });
});
