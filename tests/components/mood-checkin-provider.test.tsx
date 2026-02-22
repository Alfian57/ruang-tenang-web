import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MoodCheckinProvider } from "@/components/providers/MoodCheckinProvider";

const checkToday = vi.fn();
const record = vi.fn();
const triggerMoodRefresh = vi.fn();
const triggerTaskRefresh = vi.fn();
const refreshUser = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/store/authStore", () => ({
    useAuthStore: () => ({ token: "token-123", refreshUser }),
}));

vi.mock("@/store/dashboardStore", () => ({
    useDashboardStore: () => ({ triggerMoodRefresh, triggerTaskRefresh }),
}));

vi.mock("@/services/api", () => ({
    moodService: {
        checkToday: (...args: unknown[]) => checkToday(...args),
        record: (...args: unknown[]) => record(...args),
    },
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccess(...args),
        error: (...args: unknown[]) => toastError(...args),
    },
}));

vi.mock("@/app/dashboard/_components/MoodCheckinModal", () => ({
    MoodCheckinModal: ({ isOpen, onMoodSelected }: any) => (
        <div>
            <div>{isOpen ? "Mood Modal Open" : "Mood Modal Closed"}</div>
            <button onClick={() => onMoodSelected("happy")}>Pick Happy</button>
        </div>
    ),
}));

describe("MoodCheckinProvider", () => {
    it("opens modal when user has not checked today", async () => {
        checkToday.mockResolvedValue({ data: { has_checked: false } });

        render(<MoodCheckinProvider />);

        expect(await screen.findByText("Mood Modal Open")).toBeInTheDocument();
    });

    it("records selected mood and triggers dashboard refresh", async () => {
        checkToday.mockResolvedValue({ data: { has_checked: false } });
        record.mockResolvedValue({ data: { id: "m1" } });

        render(<MoodCheckinProvider />);

        fireEvent.click(await screen.findByText("Pick Happy"));

        await waitFor(() => expect(record).toHaveBeenCalledWith("token-123", "happy"));
        expect(triggerMoodRefresh).toHaveBeenCalledTimes(1);
        expect(triggerTaskRefresh).toHaveBeenCalledTimes(1);
        expect(refreshUser).toHaveBeenCalledTimes(1);
        expect(toastSuccess).toHaveBeenCalled();
    });
});
