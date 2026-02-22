import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GamificationSection } from "@/app/(landing)/_components/GamificationSection";

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/app/(landing)/_components/MockDailyTasksCard", () => ({
    MockDailyTasksCard: () => <div>Mock Daily Tasks Card</div>,
}));

describe("GamificationSection", () => {
    it("renders gamification features and CTA", () => {
        render(<GamificationSection />);

        expect(screen.getByText(/Merawat Diri Jadi/i)).toBeInTheDocument();
        expect(screen.getByText("Mock Daily Tasks Card")).toBeInTheDocument();
        expect(screen.getByText("XP & Level Up")).toBeInTheDocument();
        expect(screen.getByText("Daily Tasks")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Lihat Komunitas & Gamifikasi/i })).toHaveAttribute("href", "/community");
    });
});
