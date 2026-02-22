import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChatPage from "@/app/dashboard/chat/page";

const hookState = {
    user: { name: "Alfian" },
    sessions: [],
    activeSession: null,
    messages: [],
    filter: "all" as const,
    isSending: false,
    isRecording: false,
    folders: [],
    activeFolderId: null,
    messagesEndRef: { current: null },
    newSessionDialog: false,
    setNewSessionDialog: vi.fn(),
    showDeleteModal: false,
    setShowDeleteModal: vi.fn(),
    isDeleting: false,
    mobileSidebarOpen: false,
    setMobileSidebarOpen: vi.fn(),
    showDisclaimer: true,
    showCrisisModal: true,
    setShowCrisisModal: vi.fn(),
    currentSummary: null,
    isGeneratingSummary: false,
    suggestedPrompts: [],
    journalSettings: { allow_ai_access: true },
    aiContext: { total_shared: 2 },
    setFilter: vi.fn(),
    setActiveFolderId: vi.fn(),
    handleLoadSession: vi.fn(),
    handleCreateSession: vi.fn(),
    handleSendText: vi.fn(),
    handleSendAudio: vi.fn(),
    handleToggleMessageLike: vi.fn(),
    handleTogglePin: vi.fn(),
    handleToggleFavorite: vi.fn(),
    handleToggleTrash: vi.fn(),
    handleDeletePermanent: vi.fn(),
    handleConfirmDelete: vi.fn(),
    handleCreateFolder: vi.fn(),
    handleUpdateFolder: vi.fn(),
    handleDeleteFolder: vi.fn(),
    handleMoveToFolder: vi.fn(),
    handleExport: vi.fn(),
    handleGenerateSummary: vi.fn(),
    handleSuggestedPrompt: vi.fn(),
    handleAcceptDisclaimer: vi.fn(),
};

vi.mock("@/app/dashboard/chat/_hooks/useChatPage", () => ({
    useChatPage: () => hookState,
}));

vi.mock("@/app/dashboard/chat/_components", () => ({
    ChatSidebar: ({ onFilterChange }: { onFilterChange: (f: "all" | "favorites" | "trash") => void }) => (
        <button onClick={() => onFilterChange("favorites")}>Sidebar Mock</button>
    ),
    NewSessionDialog: ({ onCreateSession }: { onCreateSession: (title: string) => void }) => (
        <button onClick={() => onCreateSession("Sesi Baru")}>New Session Mock</button>
    ),
    ChatMessagesArea: ({ onCreateSession, onGenerateSummary }: { onCreateSession: () => void; onGenerateSummary: () => void }) => (
        <div>
            <button onClick={onCreateSession}>Area Create Session</button>
            <button onClick={onGenerateSummary}>Area Generate Summary</button>
        </div>
    ),
}));

vi.mock("@/components/ui/ai-disclaimer-modal", () => ({
    AIDisclaimerModal: ({ onAccept }: { onAccept: () => void }) => (
        <button onClick={onAccept}>AI Disclaimer Mock</button>
    ),
}));

vi.mock("@/components/shared/moderation", () => ({
    CrisisSupportModal: ({ onClose }: { onClose: () => void }) => (
        <button onClick={onClose}>Crisis Modal Mock</button>
    ),
}));

vi.mock("@/components/ui/delete-confirmation-modal", () => ({
    DeleteConfirmationModal: ({ onConfirm }: { onConfirm: () => void }) => (
        <button onClick={onConfirm}>Delete Confirm Mock</button>
    ),
}));

describe("ChatPage", () => {
    it("renders page composition and forwards callbacks", () => {
        render(<ChatPage />);

        fireEvent.click(screen.getByRole("button", { name: "Sidebar Mock" }));
        expect(hookState.setFilter).toHaveBeenCalledWith("favorites");

        fireEvent.click(screen.getByRole("button", { name: "Area Create Session" }));
        expect(hookState.setNewSessionDialog).toHaveBeenCalledWith(true);

        fireEvent.click(screen.getByRole("button", { name: "Area Generate Summary" }));
        expect(hookState.handleGenerateSummary).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "AI Disclaimer Mock" }));
        expect(hookState.handleAcceptDisclaimer).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "Crisis Modal Mock" }));
        expect(hookState.setShowCrisisModal).toHaveBeenCalledWith(false);

        fireEvent.click(screen.getByRole("button", { name: "Delete Confirm Mock" }));
        expect(hookState.handleConfirmDelete).toHaveBeenCalledTimes(1);
    });
});
