import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    DesktopOnly,
    Hide,
    MobileOnly,
    ResponsiveContainer,
    ResponsiveGrid,
    Stack,
    TOUCH_TARGET_SIZE,
    breakpoints,
    safeAreaClasses,
    touchTargetStyles,
} from "@/components/ui/responsive";

describe("Responsive UI", () => {
    it("renders container with max width, padding, and centered class", () => {
        render(
            <ResponsiveContainer maxWidth="2xl" padding="lg" data-testid="container">
                Konten
            </ResponsiveContainer>
        );

        expect(screen.getByTestId("container")).toHaveClass("max-w-screen-2xl", "px-4", "mx-auto");
    });

    it("renders responsive grid with min column width style", () => {
        render(
            <ResponsiveGrid minColWidth="240px" gap="sm" data-testid="grid">
                <div>Item</div>
            </ResponsiveGrid>
        );

        expect(screen.getByTestId("grid")).toHaveStyle({
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        });
        expect(screen.getByTestId("grid")).toHaveClass("gap-2");
    });

    it("renders stack and visibility helpers", () => {
        render(
            <>
                <Stack direction="horizontal" align="center" justify="between" wrap data-testid="stack" />
                <Hide below="md" data-testid="hide-below">A</Hide>
                <MobileOnly data-testid="mobile">M</MobileOnly>
                <DesktopOnly data-testid="desktop">D</DesktopOnly>
            </>
        );

        expect(screen.getByTestId("stack")).toHaveClass("flex-row", "items-center", "justify-between", "flex-wrap");
        expect(screen.getByTestId("hide-below")).toHaveClass("hidden", "md:block");
        expect(screen.getByTestId("mobile")).toHaveClass("md:hidden");
        expect(screen.getByTestId("desktop")).toHaveClass("hidden", "md:block");
    });

    it("exports breakpoint and touch constants", () => {
        expect(TOUCH_TARGET_SIZE).toBe(44);
        expect(breakpoints.md).toBe(768);
        expect(touchTargetStyles.button).toContain("min-h-[44px]");
        expect(safeAreaClasses.bottom).toContain("safe-area-inset-bottom");
    });
});
