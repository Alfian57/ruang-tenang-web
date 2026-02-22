import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
    it("renders text and handles click", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<Button onClick={onClick}>Simpan</Button>);

        await user.click(screen.getByRole("button", { name: "Simpan" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("shows loading state and disables interaction", () => {
        render(
            <Button isLoading loadingText="Memproses...">
                Simpan
            </Button>
        );

        const button = screen.getByRole("button", { name: "Memproses..." });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-busy", "true");
        expect(screen.getByText("Memproses...")).toBeInTheDocument();
    });

    it("supports asChild rendering", () => {
        render(
            <Button asChild>
                <a href="/dashboard">Buka Dashboard</a>
            </Button>
        );

        const link = screen.getByRole("link", { name: "Buka Dashboard" });
        expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("falls back to default loading text", () => {
        render(<Button isLoading>Simpan</Button>);

        const button = screen.getByRole("button", { name: "Loading..." });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-disabled", "true");
    });
});
