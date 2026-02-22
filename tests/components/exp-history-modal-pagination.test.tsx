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

describe("ExpHistoryModal pagination", () => {
    it("moves to next page when next button clicked", async () => {
        getActivityTypes.mockResolvedValue({ data: [] });
        getLevelConfigs.mockResolvedValue({ data: [{ level: 1, min_exp: 0, badge_name: "Pemula" }] });
        getExpHistory.mockResolvedValue({
            data: [{ id: "e1", activity_type: "chat_ai", description: "Page 1", points: 5, created_at: new Date().toISOString() }],
            meta: { total_pages: 2, total_items: 2 },
        });

        render(
            <ExpHistoryModal
                isOpen
                onClose={vi.fn()}
                token="token-123"
                currentExp={50}
                currentLevel={1}
                badgeName="Sprout"
                badgeIcon="🌱"
            />
        );

        await screen.findByText("Page 1");

        const nextButton = screen.getAllByRole("button").find((button) =>
            button.querySelector("svg.lucide-chevron-right")
        ) as HTMLButtonElement;
        fireEvent.click(nextButton);

        await waitFor(() =>
            expect(getExpHistory).toHaveBeenLastCalledWith("token-123", expect.objectContaining({ page: 2 }))
        );
    });
});
