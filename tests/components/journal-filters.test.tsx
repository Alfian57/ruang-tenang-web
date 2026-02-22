import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalFilters } from "@/app/dashboard/journal/_components/JournalFilters";

const push = vi.fn();
const pathname = "/dashboard/journal";
const search = new URLSearchParams("start_date=2026-01-01&tags=kerja");

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
    usePathname: () => pathname,
    useSearchParams: () => search,
}));

vi.mock("@/store/journalStore", () => ({
    useJournalStore: () => ({ isLoading: false }),
}));

describe("JournalFilters", () => {
    it("applies filter values into query string", () => {
        const { container } = render(<JournalFilters />);

        const dateInputs = container.querySelectorAll('input[type="date"]');
        fireEvent.change(dateInputs[1], {
            target: { value: "2026-01-31" },
        });
        fireEvent.change(screen.getByPlaceholderText("contoh: kerja, liburan"), {
            target: { value: "kerja,rumah" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Terapkan Filter" }));

        expect(push).toHaveBeenCalledWith(
            expect.stringContaining("start_date=2026-01-01")
        );
        expect(push).toHaveBeenCalledWith(
            expect.stringContaining("end_date=2026-01-31")
        );
        expect(push).toHaveBeenCalledWith(
            expect.stringContaining("tags=kerja%2Crumah")
        );
    });

    it("resets all filters", () => {
        render(<JournalFilters />);

        fireEvent.click(screen.getByRole("button", { name: "Reset Filter" }));
        expect(push).toHaveBeenCalledWith("/dashboard/journal");
    });
});
