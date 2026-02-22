import { render, screen } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("Separator", () => {
    it("renders horizontal separator by default", () => {
        render(<Separator data-testid="sep" />);
        const separator = screen.getByTestId("sep");

        expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("renders vertical separator", () => {
        render(<Separator data-testid="sep-vertical" orientation="vertical" />);
        const separator = screen.getByTestId("sep-vertical");

        expect(separator).toHaveAttribute("data-orientation", "vertical");
    });

    it("respects decorative prop", () => {
        render(<Separator data-testid="sep-semantic" decorative={false} />);
        const separator = screen.getByTestId("sep-semantic");

        expect(separator).toHaveAttribute("role", "separator");
    });
});
