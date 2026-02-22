import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "@/components/ui/scroll-area";

describe("ScrollArea", () => {
    it("renders children and custom class", () => {
        const { container } = render(
            <ScrollArea className="max-h-40" data-testid="scroll-root">
                <div>Konten Panjang</div>
            </ScrollArea>
        );

        expect(screen.getByText("Konten Panjang")).toBeInTheDocument();
        expect(screen.getByTestId("scroll-root")).toHaveClass("max-h-40");
        expect(container.querySelector("[data-radix-scroll-area-viewport]")).toBeInTheDocument();
    });

    it("applies base scroll area root classes", () => {
        render(
            <ScrollArea data-testid="scroll-base">
                <div>Item</div>
            </ScrollArea>
        );

        expect(screen.getByTestId("scroll-base")).toHaveClass("relative", "overflow-hidden");
    });
});
