import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

describe("Alert", () => {
    it("renders title and description", () => {
        render(
            <Alert>
                <AlertTitle>Peringatan</AlertTitle>
                <AlertDescription>Periksa kembali input kamu</AlertDescription>
            </Alert>
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Peringatan")).toBeInTheDocument();
        expect(screen.getByText("Periksa kembali input kamu")).toBeInTheDocument();
    });

    it("triggers onDismiss when dismiss button clicked", async () => {
        const user = userEvent.setup();
        const onDismiss = vi.fn();

        render(
            <Alert dismissible onDismiss={onDismiss}>
                <AlertDescription>Isi alert</AlertDescription>
            </Alert>
        );

        await user.click(screen.getByRole("button", { name: "Tutup" }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not render dismiss button when not dismissible", () => {
        render(
            <Alert>
                <AlertDescription>Tanpa tombol tutup</AlertDescription>
            </Alert>
        );

        expect(screen.queryByRole("button", { name: "Tutup" })).not.toBeInTheDocument();
    });
});
