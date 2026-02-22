import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
    it("renders skeleton element", () => {
        render(<Skeleton data-testid="skeleton" />);
        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(<Skeleton data-testid="skeleton" className="h-8 w-20" />);
        expect(screen.getByTestId("skeleton")).toHaveClass("h-8", "w-20");
    });

    it("includes base animation class", () => {
        render(<Skeleton data-testid="skeleton-base" />);
        expect(screen.getByTestId("skeleton-base")).toHaveClass("animate-pulse");
    });
});
