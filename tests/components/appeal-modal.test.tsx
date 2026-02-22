import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppealModal } from "@/components/shared/moderation/AppealModal";
import { moderationService } from "@/services/api";

vi.mock("@/services/api", () => ({
    moderationService: {
        submitAppeal: vi.fn(),
    },
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: "token-123" }),
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AppealModal", () => {
    it("renders and disables submit when reason too short", () => {
        render(<AppealModal isOpen onClose={vi.fn()} />);

        expect(screen.getByText("Ajukan Banding")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Kirim Banding" })).toBeDisabled();
    });

    it("submits appeal when valid reason is provided", async () => {
        const onClose = vi.fn();
        vi.mocked(moderationService.submitAppeal).mockResolvedValueOnce({} as never);

        render(<AppealModal isOpen onClose={onClose} />);

        fireEvent.change(screen.getByPlaceholderText(/Jelaskan alasan Anda/i), {
            target: { value: "Saya merasa sanksi ini tidak tepat karena konteks berbeda." },
        });
        fireEvent.change(screen.getByPlaceholderText(/Tautan, tangkapan layar/i), {
            target: { value: "Bukti tambahan" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Kirim Banding" }));

        await waitFor(() => {
            expect(moderationService.submitAppeal).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
