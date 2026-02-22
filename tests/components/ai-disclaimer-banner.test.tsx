import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIDisclaimerBanner } from "@/components/ui/ai-disclaimer-banner";

describe("AIDisclaimerBanner", () => {
    it("renders disclaimer message", () => {
        render(<AIDisclaimerBanner />);

        expect(screen.getByText("Penting: Bukan Pengganti Profesional")).toBeInTheDocument();
        expect(
            screen.getByText(/AI Chat ini dirancang untuk dukungan emosional awal/i)
        ).toBeInTheDocument();
    });

    it("dismisses banner and triggers onDismiss", async () => {
        const user = userEvent.setup();
        const onDismiss = vi.fn();

        render(<AIDisclaimerBanner onDismiss={onDismiss} />);

        const dismissButton = screen.getAllByRole("button")[0];
        await user.click(dismissButton);

        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("Penting: Bukan Pengganti Profesional")).not.toBeInTheDocument();
    });
});
