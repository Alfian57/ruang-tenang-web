"use client";

import { useJournalEditor } from "../_hooks/useJournalEditor";
import { JournalEditorHeader } from "./JournalEditorHeader";
import { JournalMoodPicker } from "./JournalMoodPicker";
import { JournalTagsInput } from "./JournalTagsInput";
import { EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Save, Lock, Eye, EyeOff, Info, AlertTriangle, Loader2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { JournalToolbar } from "./JournalToolbar";

const MOOD_OPTIONS = [
    { id: 1, emoji: "😊", label: "Bahagia", color: "bg-green-100 text-green-700" },
    { id: 2, emoji: "😐", label: "Netral", color: "bg-gray-100 text-gray-700" },
    { id: 3, emoji: "😔", label: "Sedih", color: "bg-blue-100 text-blue-700" },
    { id: 4, emoji: "😠", label: "Marah", color: "bg-red-100 text-red-700" },
    { id: 5, emoji: "😫", label: "Kecewa", color: "bg-orange-100 text-orange-700" },
    { id: 6, emoji: "😭", label: "Menangis", color: "bg-purple-100 text-purple-700" },
];

interface JournalEditorProps {
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
    }) => Promise<void>;
    isSaving?: boolean;
    onBack?: () => void;
    onCancel?: () => void; // Added alias for onBack
    onGeneratePrompt?: () => Promise<void>; // Added
}

export function JournalEditor({
    initialTitle,
    initialContent,
    initialMoodId,
    initialTags,
    initialIsPrivate,
    initialShareWithAI,
    defaultShareWithAI,
    writingPrompt,
    onSave,
    isSaving = false,
    onBack,
    onCancel,
    onGeneratePrompt,
}: JournalEditorProps) {
    // Handle onBack/onCancel alias
    const handleBack = onBack || onCancel;

    const {
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
    } = useJournalEditor({
        initialTitle,
        initialContent,
        initialMoodId,
        initialTags,
        initialIsPrivate,
        initialShareWithAI,
        defaultShareWithAI,
        writingPrompt,
        onSave: async (data) => {
             await onSave(data);
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <JournalEditorHeader
                title={title}
                setTitle={setTitle}
                onBack={handleBack}
                isSaving={isSaving}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="min-h-[500px] border rounded-lg bg-white shadow-sm flex flex-col">
                        <JournalToolbar 
                            editor={editor} 
                            onGeneratePrompt={onGeneratePrompt ? () => onGeneratePrompt() : undefined}
                        />
                        <EditorContent
                            editor={editor}
                            className="flex-1 p-6 prose prose-lg max-w-none focus:outline-none min-h-[400px]"
                        />
                        <div className="px-4 py-2 border-t text-xs text-gray-500 bg-gray-50 rounded-b-lg flex justify-between items-center">
                            <span>{wordCount} kata</span>
                            {isSaving && (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Menyimpan...
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={!title.trim() || isSaving}
                            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Jurnal
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-6">
                        <div>
                            <Label className="text-sm text-gray-500 mb-2 block">Mood Hari Ini</Label>
                            <JournalMoodPicker
                                selectedMoodId={moodId}
                                onSelectMood={setMoodId}
                                moods={MOOD_OPTIONS}
                                isOpen={showMoodPicker}
                                onToggle={() => setShowMoodPicker(!showMoodPicker)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2">
                                        {isPrivate ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        Privasi Jurnal
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        {isPrivate ? "Hanya saya yang bisa baca" : "Publik (Komunitas)"}
                                    </p>
                                </div>
                                <Switch
                                    checked={!isPrivate}
                                    onCheckedChange={(checked) => setIsPrivate(!checked)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2">
                                        {shareWithAI ? (
                                            <Eye className="w-4 h-4 text-purple-500" />
                                        ) : (
                                            <EyeOff className="w-4 h-4" />
                                        )}
                                        Bagikan ke AI
                                    </Label>
                                    <div className="flex items-center gap-1">
                                        <p className="text-xs text-gray-500">
                                            Izinkan AI membaca
                                        </p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs text-xs">
                                                        Jurnal yang dibagikan dapat dibaca oleh AI Assistantmu
                                                        untuk memberikan saran dan dukungan yang lebih personal.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <Switch
                                    checked={shareWithAI}
                                    onCheckedChange={setShareWithAI}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                             <Label className="text-sm text-gray-500 mb-2 block">Tags</Label>
                             <JournalTagsInput
                                tags={tags}
                                inputValue={tagInput}
                                onInputChange={setTagInput}
                                onAddTag={handleAddTag}
                                onRemoveTag={handleRemoveTag}
                                onKeyDown={handleKeyDown}
                                disabled={isSaving}
                             />
                        </div>
                    </div>

                    {writingPrompt && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                             <h4 className="font-medium text-purple-900 mb-2 text-sm flex items-center gap-2">
                                <span className="text-lg">💡</span>
                                Ide Menulis
                             </h4>
                             <p className="text-sm text-purple-800 italic">
                                &quot;{writingPrompt}&quot;
                             </p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertTriangle className="w-6 h-6" />
                            <DialogTitle>Kamu Berharga</DialogTitle>
                        </div>
                        <DialogDescription className="space-y-3 text-left">
                            <p>
                                Kami mendeteksi kamu mungkin sedang mengalami masa sulit. Ingatlah bahwa kamu tidak sendirian.
                            </p>
                            <p>
                                Ada orang-orang yang peduli dan siap mendengarkanmu. Jangan ragu untuk mencari bantuan profesional.
                            </p>
                            <div className="p-3 bg-gray-100 rounded-lg text-sm font-medium">
                                <p>Layanan Konseling Darurat:</p>
                                <p className="text-lg font-bold text-blue-600 mt-1">119 (LISA)</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCrisisModal(false)}
                        >
                            Tutup
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                                setShowCrisisModal(false);
                            }}
                        >
                            Saya Mengerti
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
