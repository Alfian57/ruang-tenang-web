import { render, screen } from "@testing-library/react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
    it("renders children content", () => {
        render(<Badge>Status Aktif</Badge>);

        expect(screen.getByText("Status Aktif")).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
        render(
            <Badge icon={<Check aria-label="ikon-check" />}>Sukses</Badge>
        );

        expect(screen.getByLabelText("ikon-check")).toBeInTheDocument();
        expect(screen.getByText("Sukses")).toBeInTheDocument();
    });

    it("applies variant and size styles", () => {
        render(
            <Badge variant="warning" size="lg" data-testid="badge-warning">
                Warning
            </Badge>
        );

        expect(screen.getByTestId("badge-warning")).toHaveClass("bg-yellow-100", "text-sm");
    });
});
