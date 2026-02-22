import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LeaderboardSection from "@/app/(landing)/_components/LeaderboardSection";

const getLeaderboard = vi.fn();

vi.mock("framer-motion", () => ({
    motion: {
        h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/services/api", () => ({
    communityService: {
        getLeaderboard: (...args: unknown[]) => getLeaderboard(...args),
    },
}));

describe("LeaderboardSection", () => {
    it("renders top three users when data is available", async () => {
        getLeaderboard.mockResolvedValue({
            data: [
                { name: "Alya", exp: 2000, role: "Member", badge_name: "Gold" },
                { name: "Budi", exp: 1500, role: "Member", badge_name: "Silver" },
                { name: "Cici", exp: 1200, role: "Member", badge_name: "Bronze" },
            ],
        });

        render(<LeaderboardSection />);

        expect(await screen.findByText("Alya")).toBeInTheDocument();
        expect(screen.getByText("Budi")).toBeInTheDocument();
        expect(screen.getByText("Cici")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Lihat Semua Peringkat/i })).toHaveAttribute("href", "/leaderboard");
    });
});
