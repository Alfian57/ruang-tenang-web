import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
    it("renders label and hint correctly", () => {
        render(<Input id="email" label="Email" hint="Masukkan email aktif" />);

        const input = screen.getByLabelText("Email");
        expect(input).toBeInTheDocument();
        expect(screen.getByText("Masukkan email aktif")).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("toggles password visibility", async () => {
        const user = userEvent.setup();

        render(<Input id="password" label="Password" type="password" />);

        const input = screen.getByLabelText("Password");
        expect(input).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: "Tampilkan password" }));
        expect(input).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", { name: "Sembunyikan password" }));
        expect(input).toHaveAttribute("type", "password");
    });

    it("shows error text as alert and marks invalid", () => {
        render(<Input id="name" label="Nama" error="Nama wajib diisi" />);

        const input = screen.getByLabelText("Nama");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByRole("alert")).toHaveTextContent("Nama wajib diisi");
    });

    it("prioritizes error description over hint", () => {
        render(
            <Input
                id="username"
                label="Username"
                hint="Hint tidak tampil saat error"
                error="Username invalid"
            />
        );

        expect(screen.getByRole("alert")).toHaveTextContent("Username invalid");
        expect(screen.queryByText("Hint tidak tampil saat error")).not.toBeInTheDocument();
    });
});
