import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommunityStatsCard } from "@/components/shared/gamification/CommunityStatsCard";

describe("CommunityStatsCard", () => {
    it("renders all key community metrics", () => {
        const stats = {
            active_users_weekly: 40,
            total_activities: 120,
            milestones_reached: 10,
            exp_earned_this_week: 1500,
            badges_earned: 25,
            stories_shared: 12,
            supportive_hearts_given: 99,
        } as never;

        render(<CommunityStatsCard stats={stats} />);

        expect(screen.getByText("Anggota Aktif")).toBeInTheDocument();
        expect(screen.getByText("Total Aktivitas")).toBeInTheDocument();
        expect(screen.getByText("EXP Dikumpulkan")).toBeInTheDocument();
        expect(screen.getByText("Badge Diraih")).toBeInTheDocument();
        expect(screen.getByText("Cerita Dibagikan")).toBeInTheDocument();
        expect(screen.getByText("Hati Diberikan")).toBeInTheDocument();
    });
});
