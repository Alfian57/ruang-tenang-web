import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CreateJournalLoading from "@/app/dashboard/journal/create/loading";

describe("CreateJournalLoading", () => {
    it("renders skeleton sections", () => {
        const { container } = render(<CreateJournalLoading />);

        expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(10);
        expect(container.querySelectorAll(".rounded-full").length).toBeGreaterThan(3);
    });
});
