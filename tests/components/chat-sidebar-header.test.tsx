import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatSidebarHeader } from "@/app/dashboard/chat/_components/ChatSidebarHeader";

describe("ChatSidebarHeader", () => {
    it("renders count and triggers create chat", () => {
        const onCreateSession = vi.fn();

        render(
            <ChatSidebarHeader
                sessionCount={7}
                onCreateSession={onCreateSession}
            />
        );

        expect(screen.getByText("7")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /Chat Baru/i }));

        expect(onCreateSession).toHaveBeenCalledTimes(1);
    });

    it("triggers close and create folder actions", () => {
        const onClose = vi.fn();
        const onCreateSession = vi.fn();
        const onCreateFolder = vi.fn();

        render(
            <ChatSidebarHeader
                sessionCount={2}
                onClose={onClose}
                onCreateSession={onCreateSession}
                onCreateFolder={onCreateFolder}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Buat Folder" }));
        expect(onCreateFolder).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: /Chat Baru/i }));
        expect(onCreateSession).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
