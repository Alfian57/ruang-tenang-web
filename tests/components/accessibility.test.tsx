import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    LiveRegion,
    SkipLink,
    VisuallyHidden,
    touchTargetClasses,
} from "@/components/ui/accessibility";

describe("Accessibility UI", () => {
    it("renders skip link with default href and text", () => {
        render(<SkipLink />);

        const link = screen.getByRole("link", { name: "Langsung ke konten utama" });
        expect(link).toHaveAttribute("href", "#main-content");
    });

    it("renders visually hidden with custom element", () => {
        render(<VisuallyHidden as="div">Rahasia</VisuallyHidden>);

        const hidden = screen.getByText("Rahasia");
        expect(hidden.tagName).toBe("DIV");
        expect(hidden).toHaveClass("sr-only");
    });

    it("renders live region attributes", () => {
        render(<LiveRegion mode="assertive">Diperbarui</LiveRegion>);

        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-live", "assertive");
        expect(status).toHaveAttribute("aria-atomic", "true");
    });

    it("exports touch target classes", () => {
        expect(touchTargetClasses.button).toContain("min-h-[44px]");
        expect(touchTargetClasses.icon).toContain("min-w-[44px]");
    });

    it("supports custom skip link target and text", () => {
        render(
            <SkipLink href="#konten" className="custom-skip-link">
                Lompat ke konten
            </SkipLink>
        );

        const link = screen.getByRole("link", { name: "Lompat ke konten" });
        expect(link).toHaveAttribute("href", "#konten");
        expect(link).toHaveClass("custom-skip-link");
    });
});
