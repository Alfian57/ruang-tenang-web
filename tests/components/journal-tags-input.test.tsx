import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalTagsInput } from "@/app/dashboard/journal/_components/JournalTagsInput";

describe("JournalTagsInput", () => {
    it("renders tags and removes selected tag", () => {
        const onRemoveTag = vi.fn();

        render(
            <JournalTagsInput
                tags={["kerja", "healing"]}
                inputValue=""
                onInputChange={vi.fn()}
                onAddTag={vi.fn()}
                onRemoveTag={onRemoveTag}
                onKeyDown={vi.fn()}
            />
        );

        expect(screen.getByText("#kerja")).toBeInTheDocument();
        expect(screen.getByText("#healing")).toBeInTheDocument();

        fireEvent.click(screen.getAllByRole("button")[0]);
        expect(onRemoveTag).toHaveBeenCalledWith("kerja");
    });

    it("handles input and add button", () => {
        const onInputChange = vi.fn();
        const onAddTag = vi.fn();
        const onKeyDown = vi.fn();

        render(
            <JournalTagsInput
                tags={[]}
                inputValue="fokus"
                onInputChange={onInputChange}
                onAddTag={onAddTag}
                onRemoveTag={vi.fn()}
                onKeyDown={onKeyDown}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Tambah tag..."), {
            target: { value: "fokus-baru" },
        });
        fireEvent.keyDown(screen.getByPlaceholderText("Tambah tag..."), {
            key: "Enter",
        });
        fireEvent.click(screen.getAllByRole("button").at(-1) as HTMLButtonElement);

        expect(onInputChange).toHaveBeenCalledWith("fokus-baru");
        expect(onKeyDown).toHaveBeenCalled();
        expect(onAddTag).toHaveBeenCalledTimes(1);
    });
});
