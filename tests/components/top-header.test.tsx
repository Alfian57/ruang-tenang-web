import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TopHeader } from "@/components/layout/dashboard/TopHeader";

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

vi.mock("@/components/layout/dashboard", () => ({
    GlobalSearch: () => <div>Global Search Mock</div>,
}));

vi.mock("@/components/layout/dashboard/NotificationBell", () => ({
    NotificationBell: () => <div>Notification Bell Mock</div>,
}));

const baseUser = {
    id: "u-1",
    name: "Alfian",
    level: 3,
    exp: 80,
    badge_icon: "🌟",
    avatar: "",
} as any;

describe("TopHeader", () => {
    it("renders member controls and calls handlers", () => {
        const onEditProfile = vi.fn();
        const onChangePassword = vi.fn();
        const onLogout = vi.fn();
        const onShowBlockedUsers = vi.fn();
        const onShowExpHistory = vi.fn();

        render(
            <TopHeader
                user={baseUser}
                isAdmin={false}
                isModerator={false}
                onEditProfile={onEditProfile}
                onChangePassword={onChangePassword}
                onLogout={onLogout}
                onShowBlockedUsers={onShowBlockedUsers}
                onShowExpHistory={onShowExpHistory}
            />
        );

        expect(screen.getByText("Global Search Mock")).toBeInTheDocument();
        expect(screen.getByText("Notification Bell Mock")).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Level 3/i));
        expect(onShowExpHistory).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("Edit Profil"));
        fireEvent.click(screen.getByText("Ganti Password"));
        fireEvent.click(screen.getByText("Pengguna Diblokir"));
        fireEvent.click(screen.getByText("Keluar"));

        expect(onEditProfile).toHaveBeenCalledTimes(1);
        expect(onChangePassword).toHaveBeenCalledTimes(1);
        expect(onShowBlockedUsers).toHaveBeenCalledTimes(1);
        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("hides notification and blocked users for admin", () => {
        render(
            <TopHeader
                user={baseUser}
                isAdmin
                isModerator={false}
                onEditProfile={vi.fn()}
                onChangePassword={vi.fn()}
                onLogout={vi.fn()}
                onShowBlockedUsers={vi.fn()}
                onShowExpHistory={vi.fn()}
            />
        );

        expect(screen.queryByText("Notification Bell Mock")).not.toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
    });
});
