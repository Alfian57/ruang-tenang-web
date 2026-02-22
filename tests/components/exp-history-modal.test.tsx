import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpHistoryModal } from "@/components/layout/dashboard/ExpHistoryModal";

const getExpHistory = vi.fn();
const getActivityTypes = vi.fn();
const getLevelConfigs = vi.fn();

vi.mock("@/services/api", () => ({
    communityService: {
        getExpHistory: (...args: unknown[]) => getExpHistory(...args),
        getActivityTypes: (...args: unknown[]) => getActivityTypes(...args),
        getLevelConfigs: (...args: unknown[]) => getLevelConfigs(...args),
    },
}));

describe("ExpHistoryModal", () => {
    it("renders fetched history and filters", async () => {
        getActivityTypes.mockResolvedValue({ data: ["chat_ai", "forum_comment"] });
        getLevelConfigs.mockResolvedValue({ data: [{ level: 1, min_exp: 0, badge_name: "Pemula" }, { level: 2, min_exp: 100, badge_name: "Naik" }] });
        getExpHistory.mockResolvedValue({
            data: [
                { id: "e1", activity_type: "chat_ai", description: "Chat harian", points: 10, created_at: new Date().toISOString() },
            ],
            meta: { total_pages: 2, total_items: 11 },
        });

        render(
            <ExpHistoryModal
                isOpen
                onClose={vi.fn()}
                token="token-123"
                currentExp={40}
                currentLevel={1}
                badgeName="Sprout"
                badgeIcon="🌱"
            />
        );

        expect(await screen.findByText("Chat harian")).toBeInTheDocument();
        expect(screen.getByText("+10 EXP")).toBeInTheDocument();
        expect(screen.getByText("Menampilkan 1 dari 11 riwayat")).toBeInTheDocument();

        fireEvent.change(screen.getByDisplayValue("Semua Aktivitas"), { target: { value: "chat_ai" } });
        await waitFor(() =>
            expect(getExpHistory).toHaveBeenLastCalledWith("token-123", expect.objectContaining({ activity_type: "chat_ai" }))
        );
    });

    it("shows empty state when API returns no history", async () => {
        getActivityTypes.mockResolvedValue({ data: [] });
        getLevelConfigs.mockResolvedValue({ data: [{ level: 1, min_exp: 0, badge_name: "Pemula" }] });
        getExpHistory.mockResolvedValue({ data: [], meta: { total_pages: 1, total_items: 0 } });

        render(
            <ExpHistoryModal
                isOpen
                onClose={vi.fn()}
                token="token-123"
                currentExp={100}
                currentLevel={1}
                badgeName="Sprout"
                badgeIcon="🌱"
            />
        );

        expect(await screen.findByText("Belum ada riwayat EXP")).toBeInTheDocument();
    });
});
