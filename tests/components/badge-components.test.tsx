import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    BadgeCard,
    BadgeProgressCard,
    BadgeShowcase,
} from "@/components/shared/gamification/BadgeComponents";

describe("BadgeComponents", () => {
    it("renders BadgeCard with earned date", () => {
        render(
            <BadgeCard
                badge={{
                    id: 1,
                    name: "Streak 7 Hari",
                    rarity: "rare",
                    icon: "🔥",
                    description: "Konsisten 7 hari",
                    earned_at: "2026-01-01T00:00:00.000Z",
                } as never}
                showDescription
            />
        );

        expect(screen.getByText("Streak 7 Hari")).toBeInTheDocument();
        expect(screen.getByText("rare")).toBeInTheDocument();
        expect(screen.getByText("Konsisten 7 hari")).toBeInTheDocument();
    });

    it("renders BadgeProgressCard progress data", () => {
        render(
            <BadgeProgressCard
                progress={{
                    name: "Aktif Komentar",
                    description: "Beri 50 komentar",
                    rarity: "uncommon",
                    icon: "💬",
                    earned: false,
                    current_value: 12,
                    target_value: 50,
                    progress_percent: 24,
                } as never}
            />
        );

        expect(screen.getByText("Aktif Komentar")).toBeInTheDocument();
        expect(screen.getByText("12/50")).toBeInTheDocument();
    });

    it("renders empty state in BadgeShowcase", () => {
        render(
            <BadgeShowcase
                badges={{
                    total_earned: 0,
                    total_available: 10,
                    category_stats: [],
                    earned_badges: [],
                } as never}
            />
        );

        expect(screen.getByText("Belum Ada Badge")).toBeInTheDocument();
    });
});
