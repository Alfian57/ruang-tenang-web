import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DailyTaskFAB } from "@/components/shared/gamification/DailyTaskFAB";
import { communityService } from "@/services/api";

let tokenValue: string | null = "token-123";

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: tokenValue, refreshUser: vi.fn() }),
}));

vi.mock("@/store/dashboardStore", () => ({
    useDashboardStore: () => ({ taskRefreshTrigger: 0 }),
}));

vi.mock("@/services/api", () => ({
    communityService: {
        getDailyTasks: vi.fn(),
        claimTaskReward: vi.fn(),
    },
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("DailyTaskFAB", () => {
    beforeEach(() => {
        vi.spyOn(globalThis, "setInterval").mockImplementation(() => 0 as unknown as ReturnType<typeof setInterval>);
        vi.spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders null when no token", () => {
        tokenValue = null;
        const { container } = render(<DailyTaskFAB />);
        expect(container.firstChild).toBeNull();
        tokenValue = "token-123";
    });

    it("shows FAB when tasks are loaded", async () => {
        vi.mocked(communityService.getDailyTasks).mockResolvedValue({
            data: {
                tasks: [
                    {
                        id: 1,
                        task_name: "Login",
                        task_icon: "🔥",
                        xp_reward: 10,
                        current_count: 1,
                        target_count: 1,
                        is_completed: true,
                        is_claimed: false,
                    },
                ],
            },
        } as never);

        const { container } = render(<DailyTaskFAB />);

        await waitFor(() => {
            expect(container.querySelector("button.w-14.h-14")).toBeInTheDocument();
        });

        const fabButton = container.querySelector("button.w-14.h-14") as HTMLButtonElement;
        fireEvent.click(fabButton);

        expect(screen.getByText("Reset setiap hari pukul 00:00 WIB")).toBeInTheDocument();
    });
});
