import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
    StoryComment,
    StoryCommentInput,
    StoryCommentsList,
} from "@/components/shared/stories/StoryComments";

describe("StoryComment", () => {
    it("renders hidden placeholder for non-admin", () => {
        render(
            <StoryComment
                comment={{ is_hidden: true } as never}
            />
        );

        expect(screen.getByText("Komentar ini telah disembunyikan")).toBeInTheDocument();
    });

    it("triggers heart action", async () => {
        const user = userEvent.setup();
        const onHeart = vi.fn();

        render(
            <StoryComment
                comment={{
                    id: "c1",
                    content: "Semangat ya",
                    created_at: new Date().toISOString(),
                    has_hearted: true,
                    heart_count: 3,
                    is_hidden: false,
                    author: { name: "Nina", avatar: "", tier_name: "Bronze", tier_color: "#aaa" },
                } as never}
                onHeart={onHeart}
            />
        );

        await user.click(screen.getByRole("button", { name: "3" }));
        expect(onHeart).toHaveBeenCalledTimes(1);
    });
});

describe("StoryCommentsList & Input", () => {
    it("renders empty comments state", () => {
        render(<StoryCommentsList comments={[]} />);
        expect(screen.getByText("Belum ada komentar")).toBeInTheDocument();
    });

    it("submits comment input", () => {
        const onSubmit = vi.fn();
        render(<StoryCommentInput onSubmit={onSubmit} />);

        fireEvent.change(screen.getByPlaceholderText(/Tulis dukungan/i), {
            target: { value: "Komentar baru" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Kirim" }));

        expect(onSubmit).toHaveBeenCalledWith("Komentar baru");
    });
});
