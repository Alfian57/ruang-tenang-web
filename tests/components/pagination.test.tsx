import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/components/ui/pagination";

describe("Pagination", () => {
    it("returns null when totalPages is 0", () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("returns null when totalPages is 1", () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("disables previous button on first page and next on last page", () => {
        const { rerender } = render(
            <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />
        );

        expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

        rerender(<Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    });

    it("calls onPageChange when clicking page number and next", async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();

        render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

        await user.click(screen.getByRole("button", { name: "4" }));
        await user.click(screen.getByRole("button", { name: "Next page" }));

        expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
        expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    });

    it("calls previous handler when not on first page", async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();

        render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

        await user.click(screen.getByRole("button", { name: "Previous page" }));

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("does not call handlers when boundary buttons are disabled", async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();

        const { rerender } = render(
            <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
        );

        await user.click(screen.getByRole("button", { name: "Previous page" }));

        rerender(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);
        await user.click(screen.getByRole("button", { name: "Next page" }));

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it("disables all controls when disabled prop is true", async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={6}
                onPageChange={onPageChange}
                disabled
            />
        );

        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
            expect(button).toBeDisabled();
        });

        await user.click(screen.getByRole("button", { name: "4" }));
        await user.click(screen.getByRole("button", { name: "Previous page" }));
        await user.click(screen.getByRole("button", { name: "Next page" }));

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it("renders compact window with first and last page for long pagination", () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

        expect(screen.queryByRole("button", { name: "2" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "9" })).not.toBeInTheDocument();
    });

    it("shows trailing window without start ellipsis near beginning", () => {
        render(<Pagination currentPage={2} totalPages={10} onPageChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

        expect(screen.queryByRole("button", { name: "4" })).not.toBeInTheDocument();
    });

    it("shows leading window without end ellipsis near end", () => {
        render(<Pagination currentPage={9} totalPages={10} onPageChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "9" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

        expect(screen.queryByRole("button", { name: "7" })).not.toBeInTheDocument();
    });

    it("renders all pages when total pages are within visible limit", () => {
        render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    });
});
