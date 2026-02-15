"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Save,
    X,
    Sparkles,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoodType } from "@/types";
import { CrisisSupportModal } from "@/components/shared/moderation";
import { JournalToolbar } from "./JournalToolbar";

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

interface JournalEditorProps {
    initialTitle?: string;
    initialContent?: string;
    initialMoodId?: number;
    initialTags?: string[];
    initialIsPrivate?: boolean;
    initialShareWithAI?: boolean;
    onSave: (data: {
        title: string;
        content: string;
        mood_id?: number;
        tags: string[];
        is_private: boolean;
        share_with_ai: boolean;
    }) => void;
    onCancel?: () => void;
    isSaving?: boolean;
    defaultShareWithAI?: boolean;
    onGeneratePrompt?: () => void;
    writingPrompt?: string;
}

// Mood options for journal
const moodOptions: { id: number; type: MoodType; emoji: string; label: string }[] = [
    { id: 1, type: "happy", emoji: "😊", label: "Bahagia" },
    { id: 2, type: "neutral", emoji: "😐", label: "Netral" },
    { id: 3, type: "angry", emoji: "😠", label: "Marah" },
    { id: 4, type: "disappointed", emoji: "😞", label: "Kecewa" },
    { id: 5, type: "sad", emoji: "😢", label: "Sedih" },
    { id: 6, type: "crying", emoji: "😭", label: "Menangis" },
];

export function JournalEditor({
    initialTitle = "",
    initialContent = "",
    initialMoodId,
    initialTags = [],
    initialIsPrivate = true,
    initialShareWithAI = false,
    onSave,
    onCancel,
    isSaving = false,
    defaultShareWithAI = false,
    onGeneratePrompt,
    writingPrompt,
}: JournalEditorProps) {
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

    const selectedMood = moodOptions.find((m) => m.id === moodId);

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header with title */}
            <div className="p-4 border-b border-gray-200">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul jurnal..."
                    className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                />
            </div>

            {/* Writing Prompt Banner */}
            {writingPrompt && (
                <div className="mx-4 mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-purple-800">Ide menulis:</p>
                            <p className="text-sm text-purple-700 mt-1">{writingPrompt}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <JournalToolbar 
                editor={editor} 
                wordCount={wordCount} 
                onGeneratePrompt={onGeneratePrompt} 
            />

            {/* Editor Content */}
            <div className="flex-1 overflow-auto p-4">
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none min-h-[200px] focus:outline-none"
                />
            </div>

            {/* Metadata & Actions */}
            <div className="p-4 border-t border-gray-200 space-y-4">
                {/* Mood Picker */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Mood:</span>
                    <div className="relative">
                        <button
                            onClick={() => setShowMoodPicker(!showMoodPicker)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
                                moodId
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {selectedMood ? (
                                <>
                                    <span className="text-lg">{selectedMood.emoji}</span>
                                    <span className="text-sm">{selectedMood.label}</span>
                                </>
                            ) : (
                                <span className="text-sm text-gray-500">Pilih mood</span>
                            )}
                        </button>
                        {showMoodPicker && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg flex gap-1 z-10">
                                {moodOptions.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => {
                                            setMoodId(mood.id === moodId ? undefined : mood.id);
                                            setShowMoodPicker(false);
                                        }}
                                        className={cn(
                                            "p-2 rounded-lg hover:bg-gray-100 transition-colors",
                                            mood.id === moodId && "bg-primary/10 ring-2 ring-primary"
                                        )}
                                        title={mood.label}
                                    >
                                        <span className="text-2xl">{mood.emoji}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                            #{tag}
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {tags.length < 10 && (
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleAddTag}
                            placeholder="Tambah tag..."
                            className="w-24 h-7 text-sm border-none shadow-none focus-visible:ring-0 bg-transparent"
                        />
                    )}
                </div>

                {/* Privacy Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        {/* Private Toggle */}
                        <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                                isPrivate
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                            )}
                        >
                            {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {isPrivate ? "Privat" : "Publik"}
                        </button>

                        {/* AI Share Toggle */}
                        <button
                            onClick={() => setShareWithAI(!shareWithAI)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                                shareWithAI
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-gray-100 text-gray-600"
                            )}
                            title={shareWithAI ? "AI dapat membaca jurnal ini" : "AI tidak dapat membaca jurnal ini"}
                        >
                            {shareWithAI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {shareWithAI ? "AI dapat membaca" : "AI tidak dapat membaca"}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {onCancel && (
                            <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
                                Batal
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
                            {isSaving ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
            {/* Crisis Support Modal */}
            <CrisisSupportModal
                isOpen={showCrisisModal}
                onClose={() => setShowCrisisModal(false)}
            />
        </div>
    );
}
