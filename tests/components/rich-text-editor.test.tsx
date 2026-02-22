import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditor } from "@tiptap/react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

const mockRun = vi.fn();
const focusApi = {
    toggleBold: vi.fn(() => ({ run: mockRun })),
    undo: vi.fn(() => ({ run: mockRun })),
    redo: vi.fn(() => ({ run: mockRun })),
    toggleHeading: vi.fn(() => ({ run: mockRun })),
    toggleItalic: vi.fn(() => ({ run: mockRun })),
    toggleUnderline: vi.fn(() => ({ run: mockRun })),
    toggleStrike: vi.fn(() => ({ run: mockRun })),
    toggleCode: vi.fn(() => ({ run: mockRun })),
    toggleBulletList: vi.fn(() => ({ run: mockRun })),
    toggleOrderedList: vi.fn(() => ({ run: mockRun })),
    toggleBlockquote: vi.fn(() => ({ run: mockRun })),
    setHorizontalRule: vi.fn(() => ({ run: mockRun })),
    setImage: vi.fn(() => ({ run: mockRun })),
    extendMarkRange: vi.fn(() => ({
        unsetLink: vi.fn(() => ({ run: mockRun })),
        setLink: vi.fn(() => ({ run: mockRun })),
    })),
};

const mockChain = vi.fn(() => ({
    focus: vi.fn(() => focusApi),
}));

let allowUndo = true;
let allowRedo = true;
let currentHtml = "<p>Hello</p>";
let currentLink = "";

const mockEditor = {
    chain: mockChain,
    can: () => ({ undo: () => allowUndo, redo: () => allowRedo }),
    isActive: () => false,
    getHTML: () => currentHtml,
    commands: { setContent: vi.fn() },
    getAttributes: () => ({ href: currentLink }),
};

vi.mock("@tiptap/react", () => ({
    useEditor: vi.fn(),
    EditorContent: () => <div data-testid="editor-content" />,
}));

vi.mock("@tiptap/starter-kit", () => ({ default: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-image", () => ({ default: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-placeholder", () => ({ default: { configure: () => ({}) } }));
vi.mock("@/components/ui/input-dialog", () => ({
    InputDialog: ({
        isOpen,
        onClose,
        onConfirm,
        title,
        defaultValue,
    }: {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: (value: string) => void;
        title: ReactNode;
        defaultValue?: string;
    }) =>
        isOpen ? (
            <div>
                <div>{title}</div>
                <div data-testid="dialog-default-value">{defaultValue ?? ""}</div>
                <button onClick={() => onConfirm("https://example.com")}>confirm-dialog</button>
                <button onClick={() => onConfirm("")}>confirm-empty-dialog</button>
                <button onClick={onClose}>close-dialog</button>
            </div>
        ) : null,
}));

describe("RichTextEditor", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        allowUndo = true;
        allowRedo = true;
        currentHtml = "<p>Hello</p>";
        currentLink = "";
    });

    it("renders loading state when editor is not ready", () => {
        vi.mocked(useEditor).mockReturnValue(null as never);

        const { container } = render(<RichTextEditor content="" onChange={vi.fn()} />);

        expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders toolbar and triggers command on button click", async () => {
        const user = userEvent.setup();
        vi.mocked(useEditor).mockReturnValue(mockEditor as never);

        render(<RichTextEditor content="<p>Hi</p>" onChange={vi.fn()} editable />);

        expect(screen.getByTestId("editor-content")).toBeInTheDocument();

        await user.click(screen.getByTitle("Bold"));

        expect(mockChain).toHaveBeenCalled();
        expect(mockRun).toHaveBeenCalled();
    });

    it("hides toolbar when editable is false", () => {
        vi.mocked(useEditor).mockReturnValue(mockEditor as never);

        render(<RichTextEditor content="<p>Hi</p>" onChange={vi.fn()} editable={false} />);

        expect(screen.queryByTitle("Bold")).not.toBeInTheDocument();
        expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    });

    it("syncs external content changes via setContent", () => {
        vi.mocked(useEditor).mockReturnValue(mockEditor as never);

        const { rerender } = render(<RichTextEditor content="<p>A</p>" onChange={vi.fn()} editable />);

        expect(mockEditor.commands.setContent).toHaveBeenCalledWith("<p>A</p>");

        rerender(<RichTextEditor content="<p>A</p>" onChange={vi.fn()} editable />);
        expect(mockEditor.commands.setContent).toHaveBeenCalledTimes(1);
    });

    it("respects disabled undo/redo state", () => {
        allowUndo = false;
        allowRedo = false;
        vi.mocked(useEditor).mockReturnValue(mockEditor as never);

        render(<RichTextEditor content="<p>Hi</p>" onChange={vi.fn()} editable />);

        expect(screen.getByTitle("Undo")).toBeDisabled();
        expect(screen.getByTitle("Redo")).toBeDisabled();
    });

    it("opens link dialog with previous url and applies/clears link", async () => {
        const user = userEvent.setup();
        currentLink = "https://old.link";
        vi.mocked(useEditor).mockReturnValue(mockEditor as never);

        render(<RichTextEditor content="<p>Hi</p>" onChange={vi.fn()} editable />);

        await user.click(screen.getByTitle("Link"));
        expect(screen.getByText("Masukkan URL Link")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-default-value")).toHaveTextContent("https://old.link");

        await user.click(screen.getByRole("button", { name: "confirm-dialog" }));
        expect(focusApi.extendMarkRange).toHaveBeenCalledWith("link");

        await user.click(screen.getByTitle("Link"));
        await user.click(screen.getByRole("button", { name: "confirm-empty-dialog" }));
        expect(focusApi.extendMarkRange).toHaveBeenCalledWith("link");
    }, 15000);

    it("opens image dialog and inserts image", async () => {
        const user = userEvent.setup();
        vi.mocked(useEditor).mockReturnValue(mockEditor as never);

        render(<RichTextEditor content="<p>Hi</p>" onChange={vi.fn()} editable />);

        await user.click(screen.getByTitle("Image"));
        expect(screen.getByText("Masukkan URL Gambar")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "confirm-dialog" }));
        expect(focusApi.setImage).toHaveBeenCalledWith({ src: "https://example.com" });
    });
});
