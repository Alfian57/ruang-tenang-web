import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/components/providers/AuthProvider";

const { replace, refreshUser, storeState, useAuthStoreMock } = vi.hoisted(() => {
    const storeState = {
        isAuthenticated: false,
        token: null as string | null,
        isHydrated: true,
        user: null as any,
    };

    const refreshUser = vi.fn();
    const useAuthStoreMock: any = () => ({
        isAuthenticated: storeState.isAuthenticated,
        refreshUser,
        isHydrated: storeState.isHydrated,
    });
    useAuthStoreMock.getState = () => storeState;

    return {
        replace: vi.fn(),
        refreshUser,
        storeState,
        useAuthStoreMock,
    };
});

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace }),
}));

vi.mock("@/store/authStore", () => ({
    useAuthStore: useAuthStoreMock,
}));

describe("AuthProvider", () => {
    it("redirects when auth is required and user is not authenticated", async () => {
        storeState.isAuthenticated = false;
        storeState.token = null;
        storeState.user = null;

        render(
            <AuthProvider requireAuth>
                <div>Protected</div>
            </AuthProvider>
        );

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
        expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    });

    it("renders content for authenticated user and refreshes profile", async () => {
        storeState.isAuthenticated = true;
        storeState.token = "token-123";
        storeState.user = { role: "member" };
        refreshUser.mockResolvedValue(undefined);

        render(
            <AuthProvider requireAuth>
                <div>Protected</div>
            </AuthProvider>
        );

        await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(1));
        expect(screen.getByText("Protected")).toBeInTheDocument();
    });
});
