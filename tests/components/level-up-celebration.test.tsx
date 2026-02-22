import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LevelUpCelebration } from "@/components/shared/gamification/LevelUpCelebration";

describe("LevelUpCelebration", () => {
    it("renders level up content and close button", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <LevelUpCelebration
                onClose={onClose}
                celebration={{
                    new_level: 4,
                    tier_name: "Calm Warrior",
                    tier_color: "#8b5cf6",
                    level_description: "Kamu semakin kuat",
                    celebration_message: "Terus lanjut!",
                    newly_unlocked_features: [],
                } as never}
            />
        );

        expect(screen.getByText("Level Up! 🎉")).toBeInTheDocument();
        expect(screen.getByText("Calm Warrior")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lanjutkan Perjalanan" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
