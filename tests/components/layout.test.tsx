import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    Container,
    Divider,
    Flex,
    Grid,
    PageHeader,
    Section,
    Stack,
} from "@/components/ui/layout";

describe("Layout UI", () => {
    it("renders container and section with selected variants", () => {
        render(
            <Container size="lg" data-testid="container">
                <Section as="article" spacing="sm" data-testid="section">
                    Isi
                </Section>
            </Container>
        );

        expect(screen.getByTestId("container")).toHaveClass("max-w-6xl");
        expect(screen.getByTestId("section").tagName).toBe("ARTICLE");
        expect(screen.getByTestId("section")).toHaveClass("py-4");
    });

    it("renders page header content with actions", () => {
        render(
            <PageHeader
                title="Dashboard"
                description="Ringkasan akun"
                backLink={<a href="/">Kembali</a>}
                actions={<button>Tambah</button>}
            />
        );

        expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
        expect(screen.getByText("Ringkasan akun")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Kembali" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Tambah" })).toBeInTheDocument();
    });

    it("applies grid, flex, stack and divider classes", () => {
        const { getByTestId } = render(
            <>
                <Grid cols={4} gap="lg" data-testid="grid" />
                <Flex direction="col" justify="between" align="start" wrap gap="sm" data-testid="flex" />
                <Stack gap="xl" data-testid="stack" />
                <Divider orientation="vertical" data-testid="divider" />
            </>
        );

        expect(getByTestId("grid")).toHaveClass("lg:grid-cols-4");
        expect(getByTestId("flex")).toHaveClass("flex-col", "justify-between", "items-start", "flex-wrap");
        expect(getByTestId("stack")).toHaveClass("space-y-8");
        expect(getByTestId("divider")).toHaveClass("border-l");
    });
});
