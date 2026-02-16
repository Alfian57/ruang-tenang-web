import { useState, useCallback, useEffect } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const CRISIS_KEYWORDS = [
  "bunuh diri",
  "ingin mati",
  "akhiri hidup",
  "cutting",
  "silet tangan",
  "tidak kuat hidup",
  "mau mati",
  "gantung diri",
  "lukai diri",
];

interface UseJournalEditorProps {
    initialTitle?: string;
    initialContent?: string;
    initialMoodId?: number;
    initialTags?: string[];
    initialIsPrivate?: boolean;
    initialShareWithAI?: boolean;
    defaultShareWithAI?: boolean;
    writingPrompt?: string;
    onSave: (data: {
        title: string;
        content: string;
        mood_id?: number;
        tags: string[];
        is_private: boolean;
        share_with_ai: boolean;
    }) => void;
}

export function useJournalEditor({
    initialTitle = "",
    initialContent = "",
    initialMoodId,
    initialTags = [],
    initialIsPrivate = true,
    initialShareWithAI = false,
    defaultShareWithAI = false,
    writingPrompt,
    onSave,
}: UseJournalEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [moodId, setMoodId] = useState<number | undefined>(initialMoodId);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [tagInput, setTagInput] = useState("");
    const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
    const [shareWithAI, setShareWithAI] = useState(initialShareWithAI || defaultShareWithAI);
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [showCrisisModal, setShowCrisisModal] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: writingPrompt || "Tulis apa yang ada di pikiranmu hari ini...",
            }),
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(words);
        },
    });

    // Update placeholder when writingPrompt changes
    useEffect(() => {
        if (editor && writingPrompt) {
            const placeholderExt = editor.extensionManager.extensions
                .find((ext) => ext.name === "placeholder");
            if (placeholderExt?.options) {
                editor.setOptions({
                    extensions: [
                        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
                        Placeholder.configure({
                            placeholder: writingPrompt || "Tulis apa yang ada di pikiranmu hari ini...",
                        }),
                    ],
                });
            }
        }
    }, [writingPrompt, editor]);

    const handleAddTag = useCallback(() => {
        const newTag = tagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag) && tags.length < 10) {
            setTags([...tags, newTag]);
            setTagInput("");
        }
    }, [tagInput, tags]);

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSave = () => {
        if (!editor || !title.trim()) return;

        // Check for crisis keywords
        const contentText = editor.getText().toLowerCase();
        const titleText = title.toLowerCase();
        const hasCrisisKeyword = CRISIS_KEYWORDS.some(k => contentText.includes(k) || titleText.includes(k));

        if (hasCrisisKeyword) {
            setShowCrisisModal(true);
            return;
        }

        onSave({
            title: title.trim(),
            content: editor.getHTML(),
            mood_id: moodId,
            tags,
            is_private: isPrivate,
            share_with_ai: shareWithAI,
        });
    };

    return {
        editor,
        title,
        setTitle,
        moodId,
        setMoodId,
        tags,
        tagInput,
        setTagInput,
        isPrivate,
        setIsPrivate,
        shareWithAI,
        setShareWithAI,
        showMoodPicker,
        setShowMoodPicker,
        wordCount,
        showCrisisModal,
        setShowCrisisModal,
        handleAddTag,
        handleRemoveTag,
        handleKeyDown,
        handleSave,
    };
}
