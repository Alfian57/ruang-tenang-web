import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReportModal } from "@/components/shared/moderation/ReportModal";
import { moderationService } from "@/services/api";
import { toast } from "sonner";

const authState = { token: "token-123" as string | null };

vi.mock("@/services/api", () => ({
    moderationService: {
        createReport: vi.fn(),
    },
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => authState,
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("Shared ReportModal", () => {
    beforeEach(() => {
        authState.token = "token-123";
        vi.mocked(moderationService.createReport).mockReset();
        vi.mocked(toast.success).mockReset();
        vi.mocked(toast.error).mockReset();
    });

    it("opens modal from trigger and submit is disabled before reason selected", async () => {
        const user = userEvent.setup();

        render(<ReportModal type="forum" contentId={99} />);

        await user.click(screen.getByRole("button", { name: "Laporkan" }));

        expect(screen.getByText("Laporkan Konten")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Kirim Laporan" })).toBeDisabled();
    }, 10000);

    it("shows login error when token is missing", async () => {
        const user = userEvent.setup();
        authState.token = null;

        render(<ReportModal type="forum" contentId={99} />);

        await user.click(screen.getByRole("button", { name: "Laporkan" }));
        await user.click(screen.getByRole("combobox"));
        await user.click(screen.getByText("Spam atau Penipuan"));
        await user.click(screen.getByRole("button", { name: "Kirim Laporan" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Silakan login untuk melaporkan konten");
            expect(moderationService.createReport).not.toHaveBeenCalled();
        });
    });

    it("submits payload, trims description, and calls onSuccess", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        vi.mocked(moderationService.createReport).mockResolvedValue(undefined as never);

        render(<ReportModal type="forum" contentId={99} userId={7} onSuccess={onSuccess} />);

        await user.click(screen.getByRole("button", { name: "Laporkan" }));
        await user.click(screen.getByRole("combobox"));
        await user.click(screen.getByText("Spam atau Penipuan"));

        fireEvent.change(screen.getByPlaceholderText("Jelaskan detail pelanggaran..."), {
            target: { value: "  detail laporan  " },
        });

        await user.click(screen.getByRole("button", { name: "Kirim Laporan" }));

        await waitFor(() => {
            expect(moderationService.createReport).toHaveBeenCalledWith("token-123", {
                report_type: "forum",
                content_id: 99,
                user_id: 7,
                reason: "spam",
                description: "detail laporan",
            });
            expect(toast.success).toHaveBeenCalledWith("Laporan berhasil dikirim");
            expect(onSuccess).toHaveBeenCalledTimes(1);
        });
    });

    it("shows submit error toast when API call fails", async () => {
        const user = userEvent.setup();
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.mocked(moderationService.createReport).mockRejectedValue(new Error("fail"));

        render(<ReportModal type="forum_post" contentId={10} />);

        await user.click(screen.getByRole("button", { name: "Laporkan" }));
        await user.click(screen.getByRole("combobox"));
        await user.click(screen.getByText("Misinformasi Kesehatan"));
        await user.click(screen.getByRole("button", { name: "Kirim Laporan" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Gagal mengirim laporan");
        });
    });

    it("supports custom trigger", async () => {
        const user = userEvent.setup();

        render(
            <ReportModal
                type="article"
                contentId={1}
                trigger={<button>Buka Custom Trigger</button>}
            />
        );

        await user.click(screen.getByRole("button", { name: "Buka Custom Trigger" }));
        expect(screen.getByText("Laporkan Konten")).toBeInTheDocument();
    });
});
