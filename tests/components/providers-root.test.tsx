import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers } from "@/components/providers";

const pathState = { path: "/dashboard" };

vi.mock("next/navigation", () => ({
    usePathname: () => pathState.path,
}));

vi.mock("@/components/ui/toaster", () => ({
    Toaster: () => <div>Toaster Mounted</div>,
}));

describe("Providers", () => {
    it("stores current and previous path in sessionStorage", () => {
        sessionStorage.setItem("rt_current_path", "/login");

        const { rerender, getByText } = render(
            <Providers>
                <div>Child Content</div>
            </Providers>
        );

        expect(getByText("Child Content")).toBeInTheDocument();
        expect(getByText("Toaster Mounted")).toBeInTheDocument();
        expect(sessionStorage.getItem("rt_current_path")).toBe("/dashboard");
        expect(sessionStorage.getItem("rt_previous_path")).toBe("/login");

        pathState.path = "/dashboard/articles";
        rerender(
            <Providers>
                <div>Child Content</div>
            </Providers>
        );

        expect(sessionStorage.getItem("rt_previous_path")).toBe("/dashboard");
        expect(sessionStorage.getItem("rt_current_path")).toBe("/dashboard/articles");
    });
});
