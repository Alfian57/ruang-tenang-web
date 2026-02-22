import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/layout/Footer";

vi.mock("framer-motion", () => ({
    motion: {
        footer: ({
            children,
            initial: _initial,
            whileInView: _whileInView,
            viewport: _viewport,
            transition: _transition,
            ...props
        }: React.HTMLAttributes<HTMLElement> & {
            initial?: unknown;
            whileInView?: unknown;
            viewport?: unknown;
            transition?: unknown;
        }) => <footer {...props}>{children}</footer>,
    },
}));

describe("Footer", () => {
    it("renders brand and key navigation links", () => {
        render(<Footer />);

        expect(screen.getByAltText("Ruang Tenang")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "AI Chat Consultant" })).toHaveAttribute("href", "/dashboard/chat");
        expect(screen.getByRole("link", { name: "Kebijakan Privasi" })).toHaveAttribute("href", "/privacy-policy");
        expect(screen.getByText("halo@ruangtenang.id")).toBeInTheDocument();
    });

    it("shows current year in copyright", () => {
        render(<Footer />);

        expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Ruang Tenang`))).toBeInTheDocument();
    });
});
