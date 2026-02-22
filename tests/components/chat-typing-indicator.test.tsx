import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypingIndicator } from "@/app/dashboard/chat/_components/TypingIndicator";

describe("TypingIndicator", () => {
    it("renders default typing state", () => {
        render(<TypingIndicator />);

        expect(screen.getByText("Sedang mengetik...")).toBeInTheDocument();
        expect(screen.getByAltText("AI")).toBeInTheDocument();
    });

    it("renders recording state", () => {
        render(<TypingIndicator isRecording />);

        expect(screen.getByText("Mengirim suara...")).toBeInTheDocument();
    });
});
