import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CTASection } from "@/app/(landing)/_components/CTASection";

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe("CTASection", () => {
    it("renders call to action links", () => {
        render(<CTASection />);

        expect(screen.getByText(/Siap untuk Merasa/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Mulai Sekarang/i })).toHaveAttribute("href", "/register");
        expect(screen.getByRole("link", { name: /Sudah Punya Akun/i })).toHaveAttribute("href", "/login");
    });
});
