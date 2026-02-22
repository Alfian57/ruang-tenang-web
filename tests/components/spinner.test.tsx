import { render, screen } from "@testing-library/react";
import { Spinner, PageLoader, InlineLoader } from "@/components/ui/spinner";

describe("Spinner", () => {
    it("renders status role and default loading label", () => {
        render(<Spinner />);

        expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders custom label", () => {
        render(<Spinner label="Memuat data" />);

        expect(screen.getByRole("status", { name: "Memuat data" })).toBeInTheDocument();
        expect(screen.getAllByText("Memuat data")).toHaveLength(2);
    });
});

describe("PageLoader and InlineLoader", () => {
    it("shows default page loader message", () => {
        render(<PageLoader />);
        expect(screen.getByText("Memuat...")).toBeInTheDocument();
    });

    it("shows custom page loader message", () => {
        render(<PageLoader message="Memuat profil" />);
        expect(screen.getByText("Memuat profil")).toBeInTheDocument();
    });

    it("shows inline loader text when provided", () => {
        render(<InlineLoader text="Mengirim" />);
        expect(screen.getByText("Mengirim")).toBeInTheDocument();
    });
});
