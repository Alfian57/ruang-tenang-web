import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
    FeatureCard,
    FeatureUnlockCelebration,
    UserFeaturesOverview,
} from "@/components/shared/gamification/FeatureComponents";

describe("FeatureComponents", () => {
    it("renders locked feature state", () => {
        render(
            <FeatureCard
                feature={{ name: "Mood Tracker", description: "Lacak mood", icon: "🧠" } as never}
                isLocked
                levelsAway={2}
            />
        );

        expect(screen.getByText("Mood Tracker")).toBeInTheDocument();
        expect(screen.getByText("2 level lagi untuk membuka")).toBeInTheDocument();
    });

    it("renders user feature overview counts", () => {
        render(
            <UserFeaturesOverview
                features={{
                    current_level: 4,
                    total_unlocked: 3,
                    total_features: 8,
                    unlocked_features: [
                        { id: 1, name: "Jurnal", description: "Tulis jurnal", icon: "📓" },
                    ],
                    locked_features: [
                        { id: 2, name: "Meditasi", description: "Fitur meditasi", icon: "🧘", levels_away: 1 },
                    ],
                } as never}
            />
        );

        expect(screen.getByText("Fitur Terbuka")).toBeInTheDocument();
        expect(screen.getByText("3/8")).toBeInTheDocument();
        expect(screen.getByText(/Level 4/)).toBeInTheDocument();
    });

    it("renders feature unlock celebration and handles close", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <FeatureUnlockCelebration
                levelName="Level 5"
                features={[{ id: 1, name: "Forum Premium", description: "Akses premium", icon: "✨" } as never]}
                onClose={onClose}
            />
        );

        expect(screen.getByText("Selamat! 🎉")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Lanjutkan" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
