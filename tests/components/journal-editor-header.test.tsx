import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalEditorHeader } from "@/app/dashboard/journal/_components/JournalEditorHeader";

describe("JournalEditorHeader", () => {
    it("renders title and updates on input change", () => {
        const setTitle = vi.fn();

        render(
            <JournalEditorHeader title="Judul Lama" setTitle={setTitle} isSaving={false} />
        );

        const input = screen.getByPlaceholderText("Judul Jurnal...");
        expect(input).toHaveValue("Judul Lama");

        fireEvent.change(input, { target: { value: "Judul Baru" } });
        expect(setTitle).toHaveBeenCalledWith("Judul Baru");
    });

    it("disables input while saving", () => {
        render(
            <JournalEditorHeader title="Judul" setTitle={vi.fn()} isSaving />
        );

        expect(screen.getByPlaceholderText("Judul Jurnal...")).toBeDisabled();
    });
});
