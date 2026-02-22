import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChatPage } from "@/app/dashboard/chat/_hooks/useChatPage";

const useAuthStoreMock = vi.fn();
const useChatStoreMock = vi.fn();
const useJournalStoreMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: vi.fn() }),
    usePathname: () => "/dashboard/chat",
    useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => useAuthStoreMock(),
}));

vi.mock("@/store/chatStore", () => ({
    useChatStore: () => useChatStoreMock(),
}));

vi.mock("@/store/journalStore", () => ({
    useJournalStore: () => useJournalStoreMock(),
}));

function Harness() {
    const hook = useChatPage();

    return (
        <div>
            <div data-testid="crisis-open">{hook.showCrisisModal ? "yes" : "no"}</div>
            <button onClick={() => hook.handleSendText("aku mau mati")}>send-crisis</button>
            <button onClick={() => hook.handleSendText("halo biasa")}>send-normal</button>
            <button onClick={() => hook.handleDeletePermanent({ stopPropagation: vi.fn() } as never, "s-1")}>open-delete</button>
            <button onClick={() => hook.handleConfirmDelete()}>confirm-delete</button>
            <button onClick={() => hook.handleSuggestedPrompt("tolong bantu")}>suggested</button>
            <button onClick={() => hook.handleExport("pdf")}>export-pdf</button>
            <button onClick={() => hook.handleGenerateSummary()}>summary</button>
        </div>
    );
}

describe("useChatPage handlers", () => {
    it("blocks crisis text and allows normal message", async () => {
        const sendTextMessage = vi.fn();

        useAuthStoreMock.mockReturnValue({ token: "token", user: { has_accepted_ai_disclaimer: true } });
        useChatStoreMock.mockReturnValue({
            sessions: [],
            activeSession: { uuid: "s-1" },
            messages: [],
            filter: "all",
            isSending: false,
            isRecording: false,
            folders: [],
            activeFolderId: null,
            loadFolders: vi.fn(),
            createFolder: vi.fn(),
            updateFolder: vi.fn(),
            deleteFolder: vi.fn(),
            moveSessionToFolder: vi.fn(),
            setActiveFolderId: vi.fn(),
            toggleMessagePin: vi.fn(),
            exportChat: vi.fn(),
            currentSummary: null,
            isGeneratingSummary: false,
            loadSummary: vi.fn(),
            generateSummary: vi.fn(),
            suggestedPrompts: [],
            loadSuggestedPrompts: vi.fn(),
            loadSessions: vi.fn(),
            loadSession: vi.fn(),
            createSession: vi.fn(),
            deleteSession: vi.fn(),
            sendTextMessage,
            sendAudioMessage: vi.fn(),
            toggleMessageLike: vi.fn(),
            toggleFavorite: vi.fn(),
            toggleTrash: vi.fn(),
            setFilter: vi.fn(),
            clearActiveSession: vi.fn(),
        });
        useJournalStoreMock.mockReturnValue({
            settings: null,
            aiContext: null,
            loadSettings: vi.fn(),
            loadAIContext: vi.fn(),
        });

        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "send-crisis" }));
        expect(screen.getByTestId("crisis-open")).toHaveTextContent("yes");
        expect(sendTextMessage).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "send-normal" }));
        expect(sendTextMessage).toHaveBeenCalledWith("token", "halo biasa");
    });

    it("handles delete flow, suggested prompt, export, and summary", async () => {
        const deleteSession = vi.fn().mockResolvedValue(undefined);
        const createSession = vi.fn().mockResolvedValue(undefined);
        const sendTextMessage = vi.fn().mockResolvedValue(undefined);
        const exportChat = vi.fn().mockResolvedValue(undefined);
        const generateSummary = vi.fn().mockResolvedValue(undefined);

        useAuthStoreMock.mockReturnValue({ token: "token", user: { has_accepted_ai_disclaimer: true } });
        useChatStoreMock.mockReturnValue({
            sessions: [],
            activeSession: null,
            messages: [],
            filter: "all",
            isSending: false,
            isRecording: false,
            folders: [],
            activeFolderId: null,
            loadFolders: vi.fn(),
            createFolder: vi.fn(),
            updateFolder: vi.fn(),
            deleteFolder: vi.fn(),
            moveSessionToFolder: vi.fn(),
            setActiveFolderId: vi.fn(),
            toggleMessagePin: vi.fn(),
            exportChat,
            currentSummary: null,
            isGeneratingSummary: false,
            loadSummary: vi.fn(),
            generateSummary,
            suggestedPrompts: [],
            loadSuggestedPrompts: vi.fn(),
            loadSessions: vi.fn(),
            loadSession: vi.fn(),
            createSession,
            deleteSession,
            sendTextMessage,
            sendAudioMessage: vi.fn(),
            toggleMessageLike: vi.fn(),
            toggleFavorite: vi.fn(),
            toggleTrash: vi.fn(),
            setFilter: vi.fn(),
            clearActiveSession: vi.fn(),
        });
        useJournalStoreMock.mockReturnValue({
            settings: null,
            aiContext: null,
            loadSettings: vi.fn(),
            loadAIContext: vi.fn(),
        });

        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "open-delete" }));
        fireEvent.click(screen.getByRole("button", { name: "confirm-delete" }));
        await waitFor(() => expect(deleteSession).toHaveBeenCalledWith("token", "s-1"));

        fireEvent.click(screen.getByRole("button", { name: "suggested" }));
        await waitFor(() => {
            expect(createSession).toHaveBeenCalledWith("token", "tolong bantu");
            expect(sendTextMessage).toHaveBeenCalledWith("token", "tolong bantu");
        });

        fireEvent.click(screen.getByRole("button", { name: "export-pdf" }));
        fireEvent.click(screen.getByRole("button", { name: "summary" }));
        expect(exportChat).not.toHaveBeenCalled();
        expect(generateSummary).not.toHaveBeenCalled();
    });
});
