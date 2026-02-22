import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PersonalJourneyCard } from "@/components/shared/gamification/PersonalJourneyCard";

describe("PersonalJourneyCard", () => {
    it("renders level, tier, and progress stats", () => {
        const journey = {
            name: "Penjelajah Tenang",
            current_level: 3,
            tier_name: "Calm Explorer",
            tier_color: "#6366f1",
            rank_in_level: 2,
            total_in_level: 30,
            current_exp: 1300,
            exp_progress: 300,
            exp_to_next_level: 200,
            current_streak: 5,
            longest_streak: 12,
            weekly_exp: 250,
            badges_earned: 7,
            unlocked_features: 4,
            total_features: 10,
        } as never;

        render(<PersonalJourneyCard journey={journey} />);

        expect(screen.getByText("Penjelajah Tenang")).toBeInTheDocument();
        expect(screen.getByText("Calm Explorer")).toBeInTheDocument();
        expect(screen.getByText(/Peringkat #2 dari 30/)).toBeInTheDocument();
        expect(screen.getByText(/200 EXP lagi ke level berikutnya/)).toBeInTheDocument();
        expect(screen.getByText("7 badge")).toBeInTheDocument();
    });
});
