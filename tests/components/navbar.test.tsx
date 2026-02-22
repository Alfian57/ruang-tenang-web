import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/layout/Navbar";

const authState = { isAuthenticated: false };

vi.mock("framer-motion", () => ({
    motion: {
        nav: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <nav {...props}>{children}</nav>,
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => authState,
}));

describe("Navbar", () => {
    it("renders login action for guest", () => {
        authState.isAuthenticated = false;
        render(<Navbar />);

        expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/login");
    });

    it("renders dashboard action for authenticated user", () => {
        authState.isAuthenticated = true;
        render(<Navbar />);

        expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    });

    it("opens mobile menu and closes it after selecting item", () => {
        authState.isAuthenticated = false;
        render(<Navbar />);

        const mobileMenuButton = document.querySelector("button.md\\:hidden") as HTMLButtonElement;
        fireEvent.click(mobileMenuButton);
        const featureLinks = screen.getAllByRole("link", { name: "Fitur" });
        const featureLink = featureLinks[1];
        expect(featureLink).toBeInTheDocument();

        fireEvent.click(featureLink);
        expect(screen.getAllByRole("link", { name: "Fitur" })).toHaveLength(1);
    });

    it("renders back variant", () => {
        render(<Navbar variant="back" backHref="/dashboard" backLabel="Kembali" />);

        expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", "/dashboard");
        expect(screen.queryByRole("link", { name: "Masuk" })).not.toBeInTheDocument();
    });
});
