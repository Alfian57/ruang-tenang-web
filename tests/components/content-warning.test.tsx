import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentWarning, TriggerWarningBadge } from "@/components/ui/content-warning";

describe("ContentWarning", () => {
    it("shows children directly when no warnings", () => {
        render(
            <ContentWarning triggerWarnings={[]}>
                <p>Konten aman</p>
            </ContentWarning>
        );

        expect(screen.getByText("Konten aman")).toBeInTheDocument();
        expect(screen.queryByText("Peringatan Konten")).not.toBeInTheDocument();
    });

    it("shows overlay and reveals content on click", async () => {
        const user = userEvent.setup();

        render(
            <ContentWarning triggerWarnings={["self_harm"]} title="Judul sensitif">
                <p>Konten sensitif terlihat</p>
            </ContentWarning>
        );

        expect(screen.getByText("Peringatan Konten")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Tampilkan Konten" }));

        expect(screen.getByText("Konten sensitif terlihat")).toBeInTheDocument();
        expect(screen.getByText("Sembunyikan")).toBeInTheDocument();
    });

    it("shows compact banner when preference is show", () => {
        render(
            <ContentWarning triggerWarnings={["anxiety"]} preference="show">
                <p>Konten ditampilkan</p>
            </ContentWarning>
        );

        expect(screen.getByText("Konten ditampilkan")).toBeInTheDocument();
        expect(screen.getByText("Peringatan Konten:")).toBeInTheDocument();
    });
});

describe("TriggerWarningBadge", () => {
    it("returns null when warnings empty", () => {
        const { container } = render(<TriggerWarningBadge warnings={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders badge when warnings exist", () => {
        render(<TriggerWarningBadge warnings={["anxiety"]} />);
        expect(screen.getByText("Peringatan Konten")).toBeInTheDocument();
    });
});
