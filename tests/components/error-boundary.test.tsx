import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { ErrorBoundary, ErrorFallback, withErrorBoundary } from "@/components/ui/error-boundary";

function ThrowError(): ReactElement {
    throw new Error("Boom");
}

describe("ErrorBoundary", () => {
    it("renders fallback UI and calls onError", () => {
        const onError = vi.fn();
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        render(
            <ErrorBoundary onError={onError}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText("Oops! Terjadi Kesalahan")).toBeInTheDocument();
        expect(onError).toHaveBeenCalledTimes(1);

        consoleSpy.mockRestore();
    });

    it("renders custom fallback when provided", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        render(
            <ErrorBoundary fallback={<div>Fallback Kustom</div>}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText("Fallback Kustom")).toBeInTheDocument();
        consoleSpy.mockRestore();
    });

    it("wraps component via HOC", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const Wrapped = withErrorBoundary(ThrowError);

        render(<Wrapped />);

        expect(screen.getByText("Oops! Terjadi Kesalahan")).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});

describe("ErrorFallback", () => {
    it("renders title, message, and reset action", async () => {
        const user = userEvent.setup();
        const resetError = vi.fn();

        render(
            <ErrorFallback
                title="Terjadi Gangguan"
                message="Silakan coba lagi"
                resetError={resetError}
            />
        );

        expect(screen.getByText("Terjadi Gangguan")).toBeInTheDocument();
        expect(screen.getByText("Silakan coba lagi")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Coba Lagi" }));
        expect(resetError).toHaveBeenCalledTimes(1);
    });
});
