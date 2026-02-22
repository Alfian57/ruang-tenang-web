import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalTagsCard } from "@/app/dashboard/journal/_components/JournalTagsCard";

describe("JournalTagsCard", () => {
    it("returns null when top tags is empty", () => {
        const { container } = render(
            <JournalTagsCard
                analytics={{ top_tags: [] } as never}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("renders top tags list", () => {
        render(
            <JournalTagsCard
                analytics={{
                    top_tags: [
                        { tag: "kerja", count: 4 },
                        { tag: "tenang", count: 2 },
                    ],
                } as never}
            />
        );

        expect(screen.getByText("Tag Populer")).toBeInTheDocument();
        expect(screen.getByText("#kerja")).toBeInTheDocument();
        expect(screen.getByText("(4)")).toBeInTheDocument();
    });
});
