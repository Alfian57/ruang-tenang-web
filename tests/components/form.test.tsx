import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
    Form,
    FormActions,
    FormField,
    FormSection,
    useFormContext,
} from "@/components/ui/form";

function FormContextFixture() {
    const { setError } = useFormContext();

    return (
        <>
            <button type="button" onClick={() => setError("email", "Email wajib diisi")}>
                Set Error
            </button>
            <FormField name="email" label="Email">
                <input aria-label="Email" />
            </FormField>
        </>
    );
}

describe("Form", () => {
    it("renders field with external error", () => {
        render(
            <Form>
                <FormField name="nama" label="Nama" required error="Nama wajib diisi">
                    <input aria-label="Nama" />
                </FormField>
            </Form>
        );

        expect(screen.getByText("Nama")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Nama wajib diisi");
        expect(screen.getByLabelText("Nama")).toHaveAttribute("aria-invalid", "true");
    });

    it("updates context error and renders section/actions", async () => {
        const user = userEvent.setup();

        render(
            <Form>
                <FormSection title="Profil" description="Lengkapi data profil">
                    <FormContextFixture />
                </FormSection>
                <FormActions align="center">
                    <button type="submit">Simpan</button>
                </FormActions>
            </Form>
        );

        expect(screen.getByText("Profil")).toBeInTheDocument();
        expect(screen.getByText("Lengkapi data profil")).toBeInTheDocument();
        expect(screen.getByText("Simpan").parentElement).toHaveClass("justify-center");

        await user.click(screen.getByRole("button", { name: "Set Error" }));

        expect(screen.getByRole("alert")).toHaveTextContent("Email wajib diisi");
    });

    it("calls onSubmit handler when form submitted", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(
            <Form onSubmit={onSubmit}>
                <button type="submit">Kirim</button>
            </Form>
        );

        await user.click(screen.getByRole("button", { name: "Kirim" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
