import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EditJournalLoading from "@/app/dashboard/journal/[uuid]/edit/loading";

describe("EditJournalLoading", () => {
    it("renders edit page skeleton blocks", () => {
        const { container } = render(<EditJournalLoading />);

        expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(10);
        expect(container.querySelectorAll(".rounded-full").length).toBeGreaterThan(3);
    });
});
