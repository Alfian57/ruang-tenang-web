import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
    it("renders label text", () => {
        render(<Label>Alamat Email</Label>);
        expect(screen.getByText("Alamat Email")).toBeInTheDocument();
    });

    it("passes htmlFor correctly", () => {
        render(<Label htmlFor="email-input">Email</Label>);
        expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
    });

    it("accepts custom className", () => {
        render(<Label className="text-red-500">Peringatan</Label>);
        expect(screen.getByText("Peringatan")).toHaveClass("text-red-500");
    });
});
