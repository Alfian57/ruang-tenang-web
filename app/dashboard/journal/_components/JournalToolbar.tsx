"use client";

import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface JournalToolbarProps {
    editor: Editor | null;
    onGeneratePrompt?: () => void;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "h-8 w-8 p-0",
                isActive && "bg-gray-200 text-foreground"
            )}
        >
            {children}
        </Button>
    );
}

export function JournalToolbar({ editor, onGeneratePrompt }: JournalToolbarProps) {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b bg-gray-50/50 p-2 flex flex-wrap gap-1 sticky top-0 z-10 rounded-t-lg items-center">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Bold (Ctrl+B)"
            >
                <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italic (Ctrl+I)"
            >
                <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Strikethrough (Ctrl+Shift+X)"
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </ToolbarButton>
            <div className="ml-auto flex items-center gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>
                {onGeneratePrompt && (
                    <>
                        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onGeneratePrompt}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 px-2"
                            title="Generate Prompt"
                        >
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
