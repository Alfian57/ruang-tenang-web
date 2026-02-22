import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationBell } from "@/components/layout/dashboard/NotificationBell";

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children, onOpenChange }: { children: any; onOpenChange?: (open: boolean) => void }) => {
        const React = require("react");
        React.useEffect(() => {
            onOpenChange?.(true);
        }, [onOpenChange]);
        return <div>{children}</div>;
    },
    DropdownMenuTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: any }) => <div>{children}</div>,
}));

const authState = { token: "token-123" };
const { api } = vi.hoisted(() => ({
    api: {
        getUnreadCount: vi.fn(),
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
    },
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => authState,
}));

vi.mock("@/services/api/notification", () => ({
    notificationService: api,
}));

describe("NotificationBell", () => {
    beforeEach(() => {
        api.getUnreadCount.mockReset();
        api.getNotifications.mockReset();
        api.markAsRead.mockReset();
        api.markAllAsRead.mockReset();
    });

    it("fetches unread count and notifications when opened", async () => {
        api.getUnreadCount.mockResolvedValue({ data: { unread_count: 2 } });
        api.getNotifications.mockResolvedValue({
            data: {
                unread_count: 2,
                notifications: [
                    {
                        id: "n-1",
                        type: "heart",
                        title: "Like baru",
                        message: "Cerita kamu disukai",
                        created_at: new Date().toISOString(),
                        is_read: false,
                    },
                ],
            },
        });

        render(<NotificationBell />);

        await waitFor(() => expect(api.getUnreadCount).toHaveBeenCalledWith("token-123"));
        expect(screen.getByText("2")).toBeInTheDocument();

        await waitFor(() => expect(api.getNotifications).toHaveBeenCalledWith("token-123", { limit: 10 }));
        expect(screen.getByText("Like baru")).toBeInTheDocument();
    });

    it("marks all notifications as read", async () => {
        api.getUnreadCount.mockResolvedValue({ data: { unread_count: 1 } });
        api.getNotifications.mockResolvedValue({
            data: {
                unread_count: 1,
                notifications: [
                    {
                        id: "n-1",
                        type: "heart",
                        title: "Like baru",
                        message: "Cerita kamu disukai",
                        created_at: new Date().toISOString(),
                        is_read: false,
                    },
                ],
            },
        });
        api.markAllAsRead.mockResolvedValue({});

        render(<NotificationBell />);

        await screen.findByText("Like baru");

        screen.getByText("Tandai Semua").click();

        await waitFor(() => expect(api.markAllAsRead).toHaveBeenCalledWith("token-123"));
        expect(screen.queryByText("Tandai Semua")).not.toBeInTheDocument();
    });
});
