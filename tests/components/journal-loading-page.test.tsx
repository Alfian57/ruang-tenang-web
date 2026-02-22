import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JournalLoading from "@/app/dashboard/journal/loading";

describe("JournalLoading Page", () => {
    it("renders skeleton placeholders", () => {
        const { container } = render(<JournalLoading />);

        expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(5);
        expect(container.querySelectorAll(".rounded-xl").length).toBeGreaterThan(0);
    });
});
