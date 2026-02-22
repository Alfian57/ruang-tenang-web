import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ImageUpload } from "@/components/ui/image-upload";
import { uploadService } from "@/services/api";

vi.mock("@/services/api", () => ({
    uploadService: {
        uploadImage: vi.fn(),
    },
}));

vi.mock("@/services/http/upload-url", () => ({
    getUploadUrl: (path: string) => path,
}));

describe("ImageUpload", () => {
    it("shows validation error for unsupported file type", async () => {
        render(<ImageUpload token="token" onChange={vi.fn()} />);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(["x"], "file.txt", { type: "text/plain" });

        fireEvent.change(input, { target: { files: [file] } });

        expect(
            screen.getByText("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.")
        ).toBeVisible();
    });

    it("uploads valid image and calls onChange", async () => {
        const onChange = vi.fn();
        vi.mocked(uploadService.uploadImage).mockResolvedValueOnce({
            data: { url: "/uploads/test.jpg" },
        } as never);

        render(<ImageUpload token="abc" onChange={onChange} />);

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(["image"], "image.jpg", { type: "image/jpeg" });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(uploadService.uploadImage).toHaveBeenCalledWith("abc", file);
            expect(onChange).toHaveBeenCalledWith("/uploads/test.jpg");
        });
    });

    it("removes current image when remove button clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<ImageUpload token="abc" value="/uploads/current.jpg" onChange={onChange} />);

        await user.click(screen.getByRole("button"));

        expect(onChange).toHaveBeenCalledWith("");
    });
});
