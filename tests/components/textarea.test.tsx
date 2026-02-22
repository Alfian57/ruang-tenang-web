import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
    it("renders with placeholder", () => {
        render(<Textarea placeholder="Tulis cerita kamu" />);
        expect(screen.getByPlaceholderText("Tulis cerita kamu")).toBeInTheDocument();
    });

    it("applies custom className and disabled state", () => {
        render(<Textarea className="custom-textarea" disabled />);
        const textarea = screen.getByRole("textbox");

        expect(textarea).toHaveClass("custom-textarea");
        expect(textarea).toBeDisabled();
    });

    it("calls onChange when typing", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<Textarea aria-label="Cerita" onChange={onChange} />);

        await user.type(screen.getByRole("textbox", { name: "Cerita" }), "halo");

        expect(onChange).toHaveBeenCalled();
    });
});
