import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useJournalEditor } from "@/app/dashboard/journal/_hooks/useJournalEditor";

let editorText = "";
const mockEditor = {
    getText: vi.fn(() => editorText),
    getHTML: vi.fn(() => "<p>Isi jurnal</p>"),
    extensionManager: { extensions: [{ name: "placeholder", options: {} }] },
    setOptions: vi.fn(),
};

vi.mock("@tiptap/react", () => ({
    useEditor: vi.fn(() => mockEditor),
}));

function Harness({ onSave }: { onSave: (data: any) => void }) {
    const hook = useJournalEditor({
        initialTitle: "Judul Awal",
        initialTags: ["syukur"],
        defaultShareWithAI: true,
        onSave,
    });

    return (
        <div>
            <div data-testid="tag-count">{hook.tags.length}</div>
            <div data-testid="crisis">{hook.showCrisisModal ? "on" : "off"}</div>
            <input
                aria-label="tag-input"
                value={hook.tagInput}
                onChange={(e) => hook.setTagInput(e.target.value)}
                onKeyDown={hook.handleKeyDown}
            />
            <button onClick={hook.handleAddTag}>add-tag</button>
            <button onClick={() => hook.handleRemoveTag("syukur")}>remove-syukur</button>
            <button onClick={hook.handleSave}>save</button>
        </div>
    );
}

describe("useJournalEditor", () => {
    it("adds/removes tags and saves normalized payload", () => {
        const onSave = vi.fn();
        editorText = "hari ini cukup baik";

        render(<Harness onSave={onSave} />);

        fireEvent.change(screen.getByLabelText("tag-input"), {
            target: { value: " Refleksi " },
        });
        fireEvent.click(screen.getByRole("button", { name: "add-tag" }));
        expect(screen.getByTestId("tag-count")).toHaveTextContent("2");

        fireEvent.click(screen.getByRole("button", { name: "remove-syukur" }));
        expect(screen.getByTestId("tag-count")).toHaveTextContent("1");

        fireEvent.click(screen.getByRole("button", { name: "save" }));

        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Judul Awal",
                content: "<p>Isi jurnal</p>",
                tags: ["refleksi"],
                is_private: true,
                share_with_ai: true,
            })
        );
    });

    it("opens crisis modal and blocks save when crisis keyword is present", () => {
        const onSave = vi.fn();
        editorText = "aku mau mati";

        render(<Harness onSave={onSave} />);

        fireEvent.click(screen.getByRole("button", { name: "save" }));

        expect(screen.getByTestId("crisis")).toHaveTextContent("on");
        expect(onSave).not.toHaveBeenCalled();
    });
});
