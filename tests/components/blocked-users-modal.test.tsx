import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BlockedUsersModal } from "@/components/shared/moderation/BlockedUsersModal";

const unblockUserMock = vi.fn();
let blockedUsersValue: Array<{
    id: number;
    blocked_id: number;
    blocked_name: string;
    blocked_avatar: string;
    created_at: string;
}> = [];

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: "token-123" }),
}));

vi.mock("@/store/blockStore", () => ({
    useBlockStore: () => ({
        blockedUsers: blockedUsersValue,
        isLoaded: true,
        unblockUser: unblockUserMock,
    }),
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("BlockedUsersModal", () => {
    it("renders empty state", () => {
        blockedUsersValue = [];
        render(<BlockedUsersModal isOpen onClose={vi.fn()} />);

        expect(screen.getByText("Tidak ada pengguna diblokir")).toBeInTheDocument();
    });

    it("renders blocked user list and unblocks via confirmation", async () => {
        const user = userEvent.setup();
        blockedUsersValue = [
            {
                id: 1,
                blocked_id: 22,
                blocked_name: "Bambang",
                blocked_avatar: "",
                created_at: new Date().toISOString(),
            },
        ];

        unblockUserMock.mockResolvedValueOnce(undefined);

        render(<BlockedUsersModal isOpen onClose={vi.fn()} />);

        expect(screen.getByText("Bambang")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Buka Blokir" }));
        fireEvent.click(screen.getByRole("button", { name: "Ya, Buka Blokir" }));

        await waitFor(() => {
            expect(unblockUserMock).toHaveBeenCalledWith("token-123", 22);
        });

        blockedUsersValue = [];
    });
});
