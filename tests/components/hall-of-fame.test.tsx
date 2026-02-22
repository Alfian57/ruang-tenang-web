import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HallOfFame } from "@/components/shared/gamification/HallOfFame";

describe("HallOfFame", () => {
    it("renders empty state when no entries", () => {
        render(
            <HallOfFame
                data={{
                    level: 2,
                    tier_name: "Explorer",
                    tier_color: "#22c55e",
                    entries: [],
                } as never}
            />
        );

        expect(screen.getByText("Hall of Fame - Level 2")).toBeInTheDocument();
        expect(screen.getByText("Belum ada anggota di level ini")).toBeInTheDocument();
    });

    it("renders entries and badge overflow indicator", () => {
        render(
            <HallOfFame
                data={{
                    level: 5,
                    tier_name: "Master",
                    tier_color: "#f59e0b",
                    entries: [
                        {
                            user_id: 1,
                            name: "Ayu",
                            avatar: "/avatar.png",
                            exp: 2500,
                            current_streak: 14,
                            badges_earned: ["🥇", "🔥", "💎", "🌟"],
                        },
                    ],
                } as never}
            />
        );

        expect(screen.getByText("Ayu")).toBeInTheDocument();
        expect(screen.getByText(/2,500 EXP/)).toBeInTheDocument();
        expect(screen.getByText("+1")).toBeInTheDocument();
    });
});
