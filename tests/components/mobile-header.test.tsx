import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MobileHeader } from "@/components/layout/dashboard/MobileHeader";

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: any; onClick?: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
    DropdownMenuLabel: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));

const user = {
    id: "u-1",
    name: "Alfi",
    level: 4,
    exp: 120,
    avatar: "",
} as any;

describe("MobileHeader", () => {
    it("shows account actions and invokes callbacks", () => {
        const onToggleSidebar = vi.fn();
        const onEditProfile = vi.fn();
        const onChangePassword = vi.fn();
        const onLogout = vi.fn();
        const onShowExpHistory = vi.fn();

        render(
            <MobileHeader
                user={user}
                isAdmin={false}
                isModerator={false}
                sidebarOpen={false}
                onToggleSidebar={onToggleSidebar}
                onEditProfile={onEditProfile}
                onChangePassword={onChangePassword}
                onLogout={onLogout}
                onShowExpHistory={onShowExpHistory}
            />
        );

        fireEvent.click(screen.getByText((content) => content.includes("Lv 4") && content.includes("120 EXP")));
        fireEvent.click(screen.getByText("Edit Profil"));
        fireEvent.click(screen.getByText("Ganti Password"));
        fireEvent.click(screen.getByText("Keluar"));

        expect(onShowExpHistory).toHaveBeenCalledTimes(1);
        expect(onEditProfile).toHaveBeenCalledTimes(1);
        expect(onChangePassword).toHaveBeenCalledTimes(1);
        expect(onLogout).toHaveBeenCalledTimes(1);

        const sidebarToggle = document.querySelector("button.h-10.w-10") as HTMLButtonElement;
        fireEvent.click(sidebarToggle);
        expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it("renders admin role badge", () => {
        render(
            <MobileHeader
                user={user}
                isAdmin
                isModerator={false}
                sidebarOpen
                onToggleSidebar={vi.fn()}
                onEditProfile={vi.fn()}
                onChangePassword={vi.fn()}
                onLogout={vi.fn()}
                onShowExpHistory={vi.fn()}
            />
        );

        expect(screen.getByText("Admin")).toBeInTheDocument();
    });
});
