import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState, NoSearchResults, ErrorState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
    it("renders title and description", () => {
        render(
            <EmptyState
                title="Belum ada cerita"
                description="Mulai tulis cerita pertama kamu"
            />
        );

        expect(screen.getByText("Belum ada cerita")).toBeInTheDocument();
        expect(screen.getByText("Mulai tulis cerita pertama kamu")).toBeInTheDocument();
    });

    it("runs action callback when button clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <EmptyState
                title="Data kosong"
                action={{ label: "Muat ulang", onClick }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Muat ulang" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

describe("NoSearchResults and ErrorState", () => {
    it("renders query text for search empty state", () => {
        render(<NoSearchResults query="mindfulness" />);

        expect(screen.getByText('Tidak ditemukan hasil untuk "mindfulness"')).toBeInTheDocument();
    });

    it("shows retry button in ErrorState and handles click", async () => {
        const user = userEvent.setup();
        const onRetry = vi.fn();

        render(<ErrorState onRetry={onRetry} />);

        await user.click(screen.getByRole("button", { name: "Coba lagi" }));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
