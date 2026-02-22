import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { XPVisualizationsSection } from "@/components/shared/gamification/XPVisualizationsSection";
import { communityService } from "@/services/api";

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: "token-123" }),
}));

vi.mock("@/services/api", () => ({
    communityService: {
        getExpHistory: vi.fn(),
    },
}));

describe("XPVisualizationsSection", () => {
    it("renders empty state when there is no history", async () => {
        vi.mocked(communityService.getExpHistory).mockResolvedValueOnce({ data: [] } as never);

        render(<XPVisualizationsSection />);

        await waitFor(() => {
            expect(screen.getByText("Belum Ada Data Statistik")).toBeInTheDocument();
        });
    });

    it("renders charts when history exists", async () => {
        vi.mocked(communityService.getExpHistory).mockResolvedValueOnce({
            data: [
                {
                    created_at: new Date().toISOString(),
                    points: 15,
                    activity_type: "daily_login",
                },
            ],
        } as never);

        render(<XPVisualizationsSection />);

        await waitFor(() => {
            expect(screen.getByText("Kalender Aktivitas")).toBeInTheDocument();
            expect(screen.getByText("XP Per Hari")).toBeInTheDocument();
            expect(screen.getByText("XP Per Aktivitas")).toBeInTheDocument();
        });
    });
});
