import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch, SwitchField } from "@/components/ui/switch";

describe("Switch", () => {
    it("calls onCheckedChange and onChange when toggled", async () => {
        const user = userEvent.setup();
        const onCheckedChange = vi.fn();
        const onChange = vi.fn();

        render(
            <Switch
                checked={false}
                onCheckedChange={onCheckedChange}
                onChange={onChange}
                aria-label="Notifikasi"
            />
        );

        await user.click(screen.getByRole("checkbox", { name: "Notifikasi" }));

        expect(onCheckedChange).toHaveBeenCalledWith(true);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("renders SwitchField label and description", () => {
        render(
            <SwitchField
                label="Mode Gelap"
                description="Aktifkan tema gelap"
                checked
                aria-label="Mode Gelap"
            />
        );

        expect(screen.getByText("Mode Gelap")).toBeInTheDocument();
        expect(screen.getByText("Aktifkan tema gelap")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Mode Gelap" })).toBeChecked();
    });

    it("does not trigger callbacks when disabled", async () => {
        const user = userEvent.setup();
        const onCheckedChange = vi.fn();
        const onChange = vi.fn();

        render(
            <Switch
                checked={false}
                disabled
                onCheckedChange={onCheckedChange}
                onChange={onChange}
                aria-label="Auto-save"
            />
        );

        await user.click(screen.getByRole("checkbox", { name: "Auto-save" }));

        expect(onCheckedChange).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });
});
