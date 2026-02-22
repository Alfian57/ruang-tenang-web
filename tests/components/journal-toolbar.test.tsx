import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalToolbar } from "@/app/dashboard/journal/_components/JournalToolbar";

function createEditorMock() {
    const run = vi.fn();
    const focusApi = {
        toggleBold: vi.fn(() => ({ run })),
        toggleItalic: vi.fn(() => ({ run })),
        toggleStrike: vi.fn(() => ({ run })),
        toggleHeading: vi.fn(() => ({ run })),
        toggleBulletList: vi.fn(() => ({ run })),
        toggleOrderedList: vi.fn(() => ({ run })),
        toggleBlockquote: vi.fn(() => ({ run })),
        undo: vi.fn(() => ({ run })),
        redo: vi.fn(() => ({ run })),
    };

    return {
        chain: () => ({ focus: () => focusApi }),
        isActive: vi.fn(() => false),
        can: () => ({ undo: () => true, redo: () => true }),
        __run: run,
        __focusApi: focusApi,
    };
}

describe("JournalToolbar", () => {
    it("returns null when editor is absent", () => {
        const { container } = render(<JournalToolbar editor={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("runs formatting actions and prompt generator", () => {
        const editor = createEditorMock();
        const onGeneratePrompt = vi.fn();

        render(
            <JournalToolbar
                editor={editor as never}
                onGeneratePrompt={onGeneratePrompt}
            />
        );

        fireEvent.click(screen.getByTitle("Bold (Ctrl+B)"));
        fireEvent.click(screen.getByTitle("Italic (Ctrl+I)"));
        fireEvent.click(screen.getByTitle("Undo (Ctrl+Z)"));
        fireEvent.click(screen.getByTitle("Generate Prompt"));

        expect(editor.__focusApi.toggleBold).toHaveBeenCalledTimes(1);
        expect(editor.__focusApi.toggleItalic).toHaveBeenCalledTimes(1);
        expect(editor.__focusApi.undo).toHaveBeenCalledTimes(1);
        expect(editor.__run).toHaveBeenCalled();
        expect(onGeneratePrompt).toHaveBeenCalledTimes(1);
    });
});
