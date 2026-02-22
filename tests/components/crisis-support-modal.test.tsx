import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CrisisSupportModal } from "@/components/shared/moderation/CrisisSupportModal";

describe("CrisisSupportModal", () => {
    it("renders emergency content and closes", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<CrisisSupportModal isOpen onClose={onClose} />);

        expect(screen.getByText("Anda Tidak Sendirian")).toBeInTheDocument();
        expect(screen.getByText(/LISA/i)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Saya Menagerti, Lanjut Menulis/i }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls custom support callback", async () => {
        const user = userEvent.setup();
        const onContactSupport = vi.fn();

        render(<CrisisSupportModal isOpen onClose={vi.fn()} onContactSupport={onContactSupport} />);

        await user.click(screen.getByRole("button", { name: "Hubungi Bantuan" }));
        expect(onContactSupport).toHaveBeenCalledTimes(1);
    });
});
