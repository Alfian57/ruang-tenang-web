import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalEditor } from "@/app/dashboard/journal/_components/JournalEditor";

const useJournalEditorMock = vi.fn();

vi.mock("@/app/dashboard/journal/_hooks/useJournalEditor", () => ({
    useJournalEditor: (...args: unknown[]) => useJournalEditorMock(...args),
}));

vi.mock("@tiptap/react", () => ({
    EditorContent: () => <div>Editor Content</div>,
}));

vi.mock("@/app/dashboard/journal/_components/JournalToolbar", () => ({
    JournalToolbar: ({ onGeneratePrompt }: { onGeneratePrompt?: () => void }) => (
        <button onClick={onGeneratePrompt}>Generate Prompt</button>
    ),
}));

vi.mock("@/app/dashboard/journal/_components/JournalMoodPicker", () => ({
    JournalMoodPicker: ({ onToggle }: { onToggle: () => void }) => (
        <button onClick={onToggle}>Toggle Mood Picker</button>
    ),
}));

vi.mock("@/app/dashboard/journal/_components/JournalTagsInput", () => ({
    JournalTagsInput: () => <div>Tags Input</div>,
}));

describe("JournalEditor", () => {
    it("returns null when editor is not ready", () => {
        useJournalEditorMock.mockReturnValue({ editor: null });

        const { container } = render(<JournalEditor onSave={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders writing prompt and triggers save handler", () => {
        const handleSave = vi.fn();

        useJournalEditorMock.mockReturnValue({
            editor: { isReady: true },
            title: "Judul Hari Ini",
            setTitle: vi.fn(),
            moodId: 1,
            setMoodId: vi.fn(),
            tags: ["syukur"],
            tagInput: "",
            setTagInput: vi.fn(),
            isPrivate: true,
            setIsPrivate: vi.fn(),
            shareWithAI: false,
            setShareWithAI: vi.fn(),
            showMoodPicker: false,
            setShowMoodPicker: vi.fn(),
            wordCount: 42,
            showCrisisModal: false,
            setShowCrisisModal: vi.fn(),
            handleAddTag: vi.fn(),
            handleRemoveTag: vi.fn(),
            handleKeyDown: vi.fn(),
            handleSave,
        });

        render(
            <JournalEditor onSave={vi.fn()} writingPrompt="Apa hal baik hari ini?" />
        );

        expect(screen.getByText("Editor Content")).toBeInTheDocument();
        expect(screen.getByText('"Apa hal baik hari ini?"')).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Simpan Jurnal" }));
        expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it("shows crisis modal and closes via Tutup button", () => {
        const setShowCrisisModal = vi.fn();

        useJournalEditorMock.mockReturnValue({
            editor: { isReady: true },
            title: "Judul",
            setTitle: vi.fn(),
            moodId: undefined,
            setMoodId: vi.fn(),
            tags: [],
            tagInput: "",
            setTagInput: vi.fn(),
            isPrivate: true,
            setIsPrivate: vi.fn(),
            shareWithAI: false,
            setShareWithAI: vi.fn(),
            showMoodPicker: false,
            setShowMoodPicker: vi.fn(),
            wordCount: 0,
            showCrisisModal: true,
            setShowCrisisModal,
            handleAddTag: vi.fn(),
            handleRemoveTag: vi.fn(),
            handleKeyDown: vi.fn(),
            handleSave: vi.fn(),
        });

        render(<JournalEditor onSave={vi.fn()} />);

        expect(screen.getByText("Kamu Berharga")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
        expect(setShowCrisisModal).toHaveBeenCalledWith(false);
    });
});
