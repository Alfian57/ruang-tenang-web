import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

describe("Avatar", () => {
    it("renders avatar root element", () => {
        render(
            <Avatar data-testid="avatar-root">
                <AvatarImage src="/avatar.webp" alt="User Avatar" />
            </Avatar>
        );

        expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
    });

    it("renders fallback content", () => {
        render(
            <Avatar>
                <AvatarFallback>RT</AvatarFallback>
            </Avatar>
        );

        expect(screen.getByText("RT")).toBeInTheDocument();
    });

    it("passes src and alt to AvatarImage", () => {
        render(
            <Avatar>
                <AvatarImage src="/users/alfi.png" alt="Foto Profil" />
            </Avatar>
        );

        const image = screen.getByRole("img", { name: "Foto Profil" });
        expect(image).toHaveAttribute("src", "/users/alfi.png");
    });
});
