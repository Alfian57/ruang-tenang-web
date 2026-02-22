import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/toaster";

vi.mock("sonner", () => ({
    Toaster: (props: { position?: string; expand?: boolean; closeButton?: boolean; richColors?: boolean }) => (
        <div
            data-testid="sonner-toaster"
            data-position={props.position}
            data-expand={String(props.expand)}
            data-close-button={String(props.closeButton)}
            data-rich-colors={String(props.richColors)}
        />
    ),
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("Toaster", () => {
    it("renders sonner toaster with expected defaults", () => {
        render(<Toaster />);

        const toaster = screen.getByTestId("sonner-toaster");
        expect(toaster).toHaveAttribute("data-position", "top-center");
        expect(toaster).toHaveAttribute("data-expand", "true");
        expect(toaster).toHaveAttribute("data-close-button", "true");
        expect(toaster).toHaveAttribute("data-rich-colors", "true");
    });
});
