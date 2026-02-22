import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BlockUserButton } from "@/components/shared/moderation/BlockUserButton";

const blockUserMock = vi.fn();
const isBlockedMock = vi.fn();

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: "token-123" }),
}));

vi.mock("@/store/blockStore", () => ({
    useBlockStore: () => ({ blockUser: blockUserMock, isBlocked: isBlockedMock }),
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("BlockUserButton (shared)", () => {
    it("shows blocked state when user already blocked", () => {
        isBlockedMock.mockReturnValue(true);
        render(<BlockUserButton userId={5} userName="Rina" />);

        const button = screen.getByRole("button", { name: "Diblokir" });
        expect(button).toBeDisabled();
    });

    it("opens dialog and confirms blocking", async () => {
        const user = userEvent.setup();
        isBlockedMock.mockReturnValue(false);
        blockUserMock.mockResolvedValueOnce(undefined);

        render(<BlockUserButton userId={8} userName="Andi" />);

        await user.click(screen.getByRole("button", { name: "Blokir" }));
        expect(screen.getByText("Blokir Pengguna?")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Blokir Pengguna" }));

        await waitFor(() => {
            expect(blockUserMock).toHaveBeenCalledWith("token-123", 8);
        });
    });
});
