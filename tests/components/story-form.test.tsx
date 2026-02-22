import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StoryForm } from "@/components/shared/stories/StoryForm";

const categories = [
    { id: "c-1", name: "Self Love", icon: "💜" },
    { id: "c-2", name: "Recovery", icon: "🌱" },
] as any;

describe("StoryForm", () => {
    it("shows validation errors", () => {
        render(<StoryForm categories={categories} onSubmit={vi.fn()} />);

        fireEvent.click(screen.getByRole("button", { name: "Kirim Cerita" }));

        expect(screen.getByText("Judul cerita wajib diisi")).toBeInTheDocument();
        expect(screen.getByText("Isi cerita wajib diisi")).toBeInTheDocument();
        expect(screen.getByText("Pilih minimal satu kategori")).toBeInTheDocument();
    });

    it("submits valid story payload", () => {
        const onSubmit = vi.fn();

        render(<StoryForm categories={categories} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText("Judul Cerita *"), {
            target: { value: "Perjalanan bangkit dari burnout" },
        });
        fireEvent.click(screen.getByRole("button", { name: "💜 Self Love" }));
        fireEvent.change(screen.getByLabelText("Ceritamu *"), {
            target: { value: "a".repeat(120) },
        });

        fireEvent.change(screen.getByPlaceholderText("Ketik tag dan tekan Enter"), {
            target: { value: "motivasi" },
        });
        fireEvent.keyDown(screen.getByPlaceholderText("Ketik tag dan tekan Enter"), { key: "Enter" });

        fireEvent.click(screen.getByRole("button", { name: "Kirim Cerita" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Perjalanan bangkit dari burnout",
                category_ids: ["c-1"],
                tags: ["motivasi"],
            })
        );
    });

    it("requires trigger warning description when enabled", () => {
        render(<StoryForm categories={categories} onSubmit={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Judul Cerita *"), {
            target: { value: "Perjalanan menghadapi serangan panik" },
        });
        fireEvent.click(screen.getByRole("button", { name: "💜 Self Love" }));
        fireEvent.change(screen.getByLabelText("Ceritamu *"), {
            target: { value: "a".repeat(120) },
        });

        const toggles = screen.getAllByRole("button").filter((button) =>
            button.className.includes("w-12 h-6")
        );
        fireEvent.click(toggles[1]);

        fireEvent.click(screen.getByRole("button", { name: "Kirim Cerita" }));

        expect(screen.getByText("Deskripsi trigger warning wajib diisi")).toBeInTheDocument();
    });
});
