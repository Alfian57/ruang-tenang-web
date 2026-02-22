import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("Tabs", () => {
    it("switches active content when clicking another tab", async () => {
        const user = userEvent.setup();

        render(
            <Tabs defaultValue="akun">
                <TabsList>
                    <TabsTrigger value="akun">Akun</TabsTrigger>
                    <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
                </TabsList>
                <TabsContent value="akun">Konten Akun</TabsContent>
                <TabsContent value="keamanan">Konten Keamanan</TabsContent>
            </Tabs>
        );

        expect(screen.getByText("Konten Akun")).toBeVisible();
        expect(screen.queryByText("Konten Keamanan")).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Keamanan" }));

        expect(screen.getByText("Konten Keamanan")).toBeVisible();
        expect(screen.queryByText("Konten Akun")).not.toBeInTheDocument();
    });

    it("supports disabled tab trigger", () => {
        render(
            <Tabs defaultValue="first">
                <TabsList>
                    <TabsTrigger value="first">First</TabsTrigger>
                    <TabsTrigger value="second" disabled>
                        Second
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        );

        expect(screen.getByRole("tab", { name: "Second" })).toBeDisabled();
    });

    it("renders custom className on TabsList", () => {
        render(
            <Tabs defaultValue="first">
                <TabsList className="tabs-list-custom">
                    <TabsTrigger value="first">First</TabsTrigger>
                </TabsList>
            </Tabs>
        );

        expect(screen.getByRole("tablist")).toHaveClass("tabs-list-custom");
    });
});
