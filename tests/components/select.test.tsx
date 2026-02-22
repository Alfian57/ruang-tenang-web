import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    Select,
    SelectContent,
    SelectField,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

describe("Select", () => {
    it("renders trigger placeholder", () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih mood" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="senang">Senang</SelectItem>
                    <SelectItem value="sedih">Sedih</SelectItem>
                </SelectContent>
            </Select>
        );

        expect(screen.getByRole("combobox")).toHaveTextContent("Pilih mood");
    });

    it("renders error state on SelectField", () => {
        render(
            <SelectField label="Kategori" error="Wajib dipilih" required>
                <SelectItem value="a">A</SelectItem>
            </SelectField>
        );

        expect(screen.getByText("Kategori")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Wajib dipilih");
        expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    });

    it("renders hint when no error is provided", () => {
        render(
            <SelectField label="Mood" hint="Pilih mood harian">
                <SelectItem value="tenang">Tenang</SelectItem>
            </SelectField>
        );

        expect(screen.getByText("Pilih mood harian")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
