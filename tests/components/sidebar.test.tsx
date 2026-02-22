import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/layout/dashboard/Sidebar";

const pathnameState = { pathname: "/dashboard" };

vi.mock("next/navigation", () => ({
    usePathname: () => pathnameState.pathname,
}));

describe("Sidebar", () => {
    it("renders member highlight link and closes on click", () => {
        pathnameState.pathname = "/dashboard/chat";
        const onCloseSidebar = vi.fn();

        render(
            <Sidebar
                isAdmin={false}
                isModerator={false}
                sidebarOpen
                sidebarCollapsed={false}
                onCloseSidebar={onCloseSidebar}
                onToggleCollapsed={vi.fn()}
            />
        );

        const aiLink = screen.getByRole("link", { name: /Teman Cerita AI/i });
        expect(aiLink).toHaveClass("active");

        fireEvent.click(aiLink);
        expect(onCloseSidebar).toHaveBeenCalled();

        fireEvent.click(document.querySelector(".bg-black\\/50") as Element);
        expect(onCloseSidebar).toHaveBeenCalledTimes(2);
    }, 15000);

    it("renders admin navigation without member highlight", () => {
        pathnameState.pathname = "/dashboard/admin";

        render(
            <Sidebar
                isAdmin
                isModerator={false}
                sidebarOpen={false}
                sidebarCollapsed={false}
                onCloseSidebar={vi.fn()}
                onToggleCollapsed={vi.fn()}
            />
        );

        expect(screen.queryByRole("link", { name: /Teman Cerita AI/i })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("href", "/dashboard/admin/users");
    });

    it("shows collapsed toggle and title tooltip", () => {
        pathnameState.pathname = "/dashboard";

        render(
            <Sidebar
                isAdmin={false}
                isModerator={false}
                sidebarOpen={false}
                sidebarCollapsed
                onCloseSidebar={vi.fn()}
                onToggleCollapsed={vi.fn()}
            />
        );

        expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute("title", "Beranda");
        expect(document.querySelector(".top-16.-right-3")).toBeInTheDocument();
    });
});
