import { render, screen } from "@testing-library/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

describe("Card", () => {
    it("renders full card composition", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Judul Kartu</CardTitle>
                    <CardDescription>Deskripsi singkat kartu</CardDescription>
                </CardHeader>
                <CardContent>Isi utama kartu</CardContent>
                <CardFooter>Footer kartu</CardFooter>
            </Card>
        );

        expect(screen.getByText("Judul Kartu")).toBeInTheDocument();
        expect(screen.getByText("Deskripsi singkat kartu")).toBeInTheDocument();
        expect(screen.getByText("Isi utama kartu")).toBeInTheDocument();
        expect(screen.getByText("Footer kartu")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(<Card className="custom-card">Konten</Card>);
        expect(screen.getByText("Konten")).toHaveClass("custom-card");
    });

    it("applies custom className on card sections", () => {
        render(
            <Card>
                <CardHeader className="header-custom">Header</CardHeader>
            </Card>
        );

        expect(screen.getByText("Header")).toHaveClass("header-custom");
    });
});
