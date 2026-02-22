import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthIllustration } from "@/components/shared/auth/AuthIllustration";

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, initial: _initial, animate: _animate, transition: _transition, whileHover: _whileHover, ...props }: any) => (
            <div {...props}>{children}</div>
        ),
    },
}));

describe("AuthIllustration", () => {
    it("renders default content and illustration", () => {
        render(
            <AuthIllustration
                title="Selamat Datang"
                description="Mulai perjalanan tenangmu"
            />
        );

        expect(screen.getByText("Selamat Datang")).toBeInTheDocument();
        expect(screen.getByText("Mulai perjalanan tenangmu")).toBeInTheDocument();
        expect(screen.getByAltText("RuangTenang App")).toBeInTheDocument();
    });

    it("renders custom visual and floating elements", () => {
        render(
            <AuthIllustration
                title="Masuk"
                description="Deskripsi"
                visual={<div data-testid="custom-visual">Visual</div>}
                floatingElements={<div data-testid="custom-float">Float</div>}
            />
        );

        expect(screen.getByTestId("custom-visual")).toBeInTheDocument();
        expect(screen.getByTestId("custom-float")).toBeInTheDocument();
    });
});
