import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommunitySection } from "@/app/(landing)/_components/CommunitySection";

const getStats = vi.fn();

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/services/api", () => ({
    communityService: {
        getStats: (...args: unknown[]) => getStats(...args),
    },
}));

describe("CommunitySection", () => {
    it("renders community stats and CTA", async () => {
        getStats.mockResolvedValue({
            data: {
                total_users: 150,
                supportive_hearts_given: 320,
                stories_shared: 25,
                total_activities: 999,
            },
        });

        render(<CommunitySection />);

        expect(await screen.findByText(/Bersama Kita/i)).toBeInTheDocument();
        expect(screen.getByText("Pengguna Aktif")).toBeInTheDocument();
        expect(screen.getByText("Dukungan Diberikan")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Jelajahi Komunitas/i })).toHaveAttribute("href", "/community");
    });
});
