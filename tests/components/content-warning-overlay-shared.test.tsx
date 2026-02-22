import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ContentWarningOverlay } from "@/components/shared/moderation/ContentWarningOverlay";

describe("ContentWarningOverlay (shared)", () => {
    it("shows warning state and reveals content on click", async () => {
        const user = userEvent.setup();

        render(
            <ContentWarningOverlay warningText="Konten sensitif">
                <div>Konten Asli</div>
            </ContentWarningOverlay>
        );

        expect(screen.getByText("Peringatan Konten")).toBeInTheDocument();
        expect(screen.getByText("Konten sensitif")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lihat Konten" }));

        expect(screen.getByText("Konten Asli")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sembunyikan" })).toBeInTheDocument();
    });
});
