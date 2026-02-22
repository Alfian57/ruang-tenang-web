import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

describe("Tooltip", () => {
    it("shows tooltip content on hover", async () => {
        const user = userEvent.setup();

        render(
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button>Info</button>
                    </TooltipTrigger>
                    <TooltipContent>Pesan bantuan</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );

        await user.hover(screen.getByRole("button", { name: "Info" }));
        expect(screen.getByRole("tooltip")).toHaveTextContent("Pesan bantuan");

    });

    it("hides tooltip content on unhover", async () => {
        const user = userEvent.setup();

        render(
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button>Help</button>
                    </TooltipTrigger>
                    <TooltipContent>Bantuan</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );

        const trigger = screen.getByRole("button", { name: "Help" });
        await user.hover(trigger);
        expect(screen.getByRole("tooltip")).toHaveTextContent("Bantuan");

        await user.unhover(trigger);
        await waitFor(() => {
            expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        });
    });
});
