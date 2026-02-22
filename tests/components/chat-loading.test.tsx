import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChatLoading from "@/app/dashboard/chat/loading";

describe("ChatLoading", () => {
    it("renders loading skeleton blocks", () => {
        const { container } = render(<ChatLoading />);

        expect(container.querySelector(".animate-pulse")).toBeTruthy();
        expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(10);
        expect(container.querySelector(".hidden.lg\\:block.w-80")).toBeTruthy();
    });
});
