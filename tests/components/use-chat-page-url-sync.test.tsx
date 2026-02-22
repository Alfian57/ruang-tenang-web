import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChatPage } from "@/app/dashboard/chat/_hooks/useChatPage";

const replace = vi.fn();
const useAuthStoreMock = vi.fn();
const useChatStoreMock = vi.fn();
const useJournalStoreMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace }),
    usePathname: () => "/dashboard/chat",
    useSearchParams: () => useSearchParamsMock(),
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
    return <div data-testid="filter">{hook.filter}</div>;
}

describe("useChatPage URL sync", () => {
    it("loads initial resources and syncs view/session from URL", async () => {
        const setFilter = vi.fn();
        const loadSession = vi.fn();
        const loadSessions = vi.fn();
        const loadFolders = vi.fn();
        const loadSuggestedPrompts = vi.fn();

        useSearchParamsMock.mockReturnValue(new URLSearchParams("view=favorites&session=s-99"));
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
            loadFolders,
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
            loadSuggestedPrompts,
            loadSessions,
            loadSession,
            createSession: vi.fn(),
            deleteSession: vi.fn(),
            sendTextMessage: vi.fn(),
            sendAudioMessage: vi.fn(),
            toggleMessageLike: vi.fn(),
            toggleFavorite: vi.fn(),
            toggleTrash: vi.fn(),
            setFilter,
            clearActiveSession: vi.fn(),
        });
        useJournalStoreMock.mockReturnValue({
            settings: { allow_ai_access: true },
            aiContext: { total_shared: 2 },
            loadSettings: vi.fn(),
            loadAIContext: vi.fn(),
        });

        render(<Harness />);

        await waitFor(() => {
            expect(loadSessions).toHaveBeenCalledWith("token");
            expect(loadFolders).toHaveBeenCalledWith("token");
            expect(loadSuggestedPrompts).toHaveBeenCalledWith("token");
            expect(setFilter).toHaveBeenCalledWith("favorites");
            expect(loadSession).toHaveBeenCalledWith("token", "s-99");
        });
    });

    it("clears active session when URL has no session param", async () => {
        const clearActiveSession = vi.fn();

        useSearchParamsMock.mockReturnValue(new URLSearchParams("view=all"));
        useAuthStoreMock.mockReturnValue({ token: "token", user: { has_accepted_ai_disclaimer: true } });
        useChatStoreMock.mockReturnValue({
            sessions: [],
            activeSession: { uuid: "old-s" },
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
            sendTextMessage: vi.fn(),
            sendAudioMessage: vi.fn(),
            toggleMessageLike: vi.fn(),
            toggleFavorite: vi.fn(),
            toggleTrash: vi.fn(),
            setFilter: vi.fn(),
            clearActiveSession,
        });
        useJournalStoreMock.mockReturnValue({
            settings: null,
            aiContext: null,
            loadSettings: vi.fn(),
            loadAIContext: vi.fn(),
        });

        render(<Harness />);

        await waitFor(() => {
            expect(clearActiveSession).toHaveBeenCalledTimes(1);
        });
    });
});
