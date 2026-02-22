import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DailyTaskWidget } from "@/components/shared/gamification/DailyTaskWidget";
import { communityService } from "@/services/api";

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: "token-123" }),
}));

vi.mock("@/services/api", () => ({
    communityService: {
        claimTaskReward: vi.fn(),
    },
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("DailyTaskWidget", () => {
    it("returns null when tasks empty", () => {
        const { container } = render(<DailyTaskWidget tasks={[]} onTaskClaimed={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it("claims completed task", async () => {
        const onTaskClaimed = vi.fn();
        vi.mocked(communityService.claimTaskReward).mockResolvedValueOnce({
            data: { xp_earned: 20, level_up: false },
        } as never);

        render(
            <DailyTaskWidget
                onTaskClaimed={onTaskClaimed}
                tasks={[
                    {
                        id: 1,
                        task_name: "Login Harian",
                        task_icon: "✅",
                        xp_reward: 20,
                        current_count: 1,
                        target_count: 1,
                        is_completed: true,
                        is_claimed: false,
                    },
                ] as never}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Klaim" }));

        await waitFor(() => {
            expect(communityService.claimTaskReward).toHaveBeenCalledWith("token-123", 1);
            expect(onTaskClaimed).toHaveBeenCalledTimes(1);
        });
    });
});
