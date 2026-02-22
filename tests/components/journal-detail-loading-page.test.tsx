import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JournalDetailLoading from "@/app/dashboard/journal/[uuid]/loading";

describe("JournalDetailLoading", () => {
    it("renders detail page skeleton", () => {
        const { container } = render(<JournalDetailLoading />);

        expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(12);
        expect(container.querySelectorAll(".rounded-2xl").length).toBeGreaterThan(0);
    });
});
