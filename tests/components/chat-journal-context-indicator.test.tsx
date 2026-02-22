import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalContextIndicator } from "@/app/dashboard/chat/_components/JournalContextIndicator";

describe("JournalContextIndicator", () => {
    it("does not render when count is zero", () => {
        const { container } = render(<JournalContextIndicator journalSharedCount={0} />);

        expect(container).toBeEmptyDOMElement();
    });

    it("renders journal count and management link", () => {
        render(<JournalContextIndicator journalSharedCount={3} />);

        expect(screen.getByText(/AI dapat membaca/i)).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Kelola/i })).toHaveAttribute("href", "/dashboard/journal");
    });
});
