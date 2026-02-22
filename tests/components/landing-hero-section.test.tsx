import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "@/app/(landing)/_components/HeroSection";

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe("HeroSection", () => {
    it("renders headline and main CTA", () => {
        render(<HeroSection />);

        expect(screen.getByRole("heading", { name: /Ruang Aman/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Masuk ke Ruang Tenang/i })).toHaveAttribute("href", "/register");
        expect(screen.getByText(/Platform ini membantu refleksi diri/i)).toBeInTheDocument();
    });
});
