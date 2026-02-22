import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeaturesSection } from "@/app/(landing)/_components/FeaturesSection";

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe("FeaturesSection", () => {
    it("renders section heading and all key features", () => {
        render(<FeaturesSection />);

        expect(screen.getByText(/Semua yang Kamu Butuhkan/i)).toBeInTheDocument();
        expect(screen.getByText("AI Chat 24/7")).toBeInTheDocument();
        expect(screen.getByText("Mood Tracker")).toBeInTheDocument();
        expect(screen.getByText("Musik Relaksasi")).toBeInTheDocument();
        expect(screen.getByText("Latihan Pernapasan")).toBeInTheDocument();
        expect(screen.getByText("Forum Komunitas")).toBeInTheDocument();
        expect(screen.getByText("Jurnal Pribadi")).toBeInTheDocument();
    });
});
