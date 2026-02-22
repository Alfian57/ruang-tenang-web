import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

describe("DropdownMenu", () => {
    it("opens content and triggers item select", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button>Aksi</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={onSelect}>Hapus</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        await user.click(screen.getByRole("button", { name: "Aksi" }));
        expect(screen.getByText("Hapus")).toBeVisible();

        await user.click(screen.getByText("Hapus"));
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("does not trigger onSelect for disabled item", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button>Aksi</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem disabled onSelect={onSelect}>
                        Nonaktif
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        await user.click(screen.getByRole("button", { name: "Aksi" }));
        await user.click(screen.getByText("Nonaktif"));

        expect(onSelect).not.toHaveBeenCalled();
    });
});
