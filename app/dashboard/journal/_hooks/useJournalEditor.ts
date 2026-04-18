import { useState, useCallback, useEffect, useMemo } from "react";
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

export type JournalMode = "brain-dump" | "structured-reflection" | "gratitude" | "action-plan";

type GuidedStepId = 1 | 2 | 3;

interface JournalModeOption {
    id: JournalMode;
    label: string;
    description: string;
    prompt: string;
    starterTitle: string;
    starterTags: string[];
    templateHtml: string;
    guidedPrompts: [string, string, string];
}

interface GuidedStep {
    id: GuidedStepId;
    title: string;
    helper: string;
    prompt: string;
}

const JOURNAL_MODE_OPTIONS: JournalModeOption[] = [
    {
        id: "brain-dump",
        label: "Brain Dump",
        description: "Tuangkan isi kepala dulu, tanpa harus rapi.",
        prompt: "Tumpahkan semua yang ada di kepala kamu tanpa disensor. Tidak perlu rapi.",
        starterTitle: "Brain Dump Hari Ini",
        starterTags: ["lepas-beban", "raw"],
        templateHtml: "<h2>Apa yang sedang memenuhi kepalaku?</h2><p></p><h3>Hal paling mengganggu sekarang</h3><p></p><h3>Hal yang sebenarnya bisa kutunda</h3><p></p><h3>Satu hal yang akan kulepas malam ini</h3><p></p>",
        guidedPrompts: [
            "Apa yang paling memenuhi kepala kamu sekarang?",
            "Apa pemicu utama yang bikin pikiranmu penuh?",
            "Apa satu beban yang bisa kamu lepaskan malam ini?",
        ],
    },
    {
        id: "structured-reflection",
        label: "Refleksi Terstruktur",
        description: "Baca ulang hari ini dengan alur yang lebih jelas.",
        prompt: "Refleksikan hari ini: fakta, emosi, pelajaran, lalu tindakan kecil berikutnya.",
        starterTitle: "Refleksi Hari Ini",
        starterTags: ["refleksi", "harian"],
        templateHtml: "<h2>1. Apa yang terjadi hari ini?</h2><p></p><h2>2. Apa yang saya rasakan?</h2><p></p><h2>3. Pelajaran yang saya dapat</h2><p></p><h2>4. Langkah kecil setelah ini</h2><p></p>",
        guidedPrompts: [
            "Tulis kejadian utama hari ini tanpa menghakimi diri.",
            "Rasa apa yang paling dominan muncul?",
            "Langkah kecil apa yang realistis dilakukan berikutnya?",
        ],
    },
    {
        id: "gratitude",
        label: "Syukur & Kekuatan",
        description: "Menangkap hal baik kecil agar energi pulih.",
        prompt: "Sebut 3 hal kecil yang membuatmu sedikit lebih tenang hari ini.",
        starterTitle: "Catatan Syukur",
        starterTags: ["syukur", "energi-positif"],
        templateHtml: "<h2>3 hal yang saya syukuri hari ini</h2><ul><li></li><li></li><li></li></ul><h3>Kekuatan yang saya pakai hari ini</h3><p></p><h3>Siapa/apa yang ingin saya apresiasi?</h3><p></p>",
        guidedPrompts: [
            "Apa momen kecil yang membuatmu sedikit lebih lega hari ini?",
            "Kekuatan apa dari dirimu yang muncul hari ini?",
            "Siapa yang ingin kamu apresiasi, dan kenapa?",
        ],
    },
    {
        id: "action-plan",
        label: "Rencana Pemulihan",
        description: "Ubah overthinking jadi rencana yang bisa dikerjakan.",
        prompt: "Pecah masalah jadi 1 langkah 10 menit yang bisa kamu lakukan sekarang.",
        starterTitle: "Rencana Pemulihan 24 Jam",
        starterTags: ["aksi-kecil", "pemulihan"],
        templateHtml: "<h2>Tantangan utama saya saat ini</h2><p></p><h3>Tujuan kecil dalam 24 jam</h3><p></p><h3>Langkah 10 menit pertama</h3><p></p><h3>Jika gagal, rencana cadangan</h3><p></p>",
        guidedPrompts: [
            "Masalah utama apa yang ingin kamu jinakkan dulu?",
            "Tujuan kecil apa yang realistis dalam 24 jam?",
            "Langkah 10 menit apa yang bisa kamu mulai sekarang?",
        ],
    },
];

const JOURNAL_MODE_MAP = JOURNAL_MODE_OPTIONS.reduce<Record<JournalMode, JournalModeOption>>((acc, mode) => {
    acc[mode.id] = mode;
    return acc;
}, {
    "brain-dump": JOURNAL_MODE_OPTIONS[0],
    "structured-reflection": JOURNAL_MODE_OPTIONS[1],
    gratitude: JOURNAL_MODE_OPTIONS[2],
    "action-plan": JOURNAL_MODE_OPTIONS[3],
});

const BASE_GUIDED_STEPS: Array<Omit<GuidedStep, "prompt">> = [
    {
        id: 1,
        title: "Langkah 1 · Rasakan",
        helper: "Validasi emosi dulu, belum perlu solusi.",
    },
    {
        id: 2,
        title: "Langkah 2 · Pahami",
        helper: "Cari pola pemicu atau konteksnya.",
    },
    {
        id: 3,
        title: "Langkah 3 · Bertindak",
        helper: "Tutup dengan aksi kecil yang realistis.",
    },
];

interface UseJournalEditorProps {
    initialTitle?: string;
    initialContent?: string;
    initialMoodId?: number;
    initialTags?: string[];
    initialIsPrivate?: boolean;
    initialShareWithAI?: boolean;
    defaultShareWithAI?: boolean;
    initialMode?: JournalMode;
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
    initialMode = "structured-reflection",
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
    const [journalMode, setJournalMode] = useState<JournalMode>(initialMode);
    const [completedGuidedSteps, setCompletedGuidedSteps] = useState<GuidedStepId[]>([]);

    const activeMode = JOURNAL_MODE_MAP[journalMode];
    const editorPlaceholder = writingPrompt || activeMode.prompt;

    const buildEditorExtensions = useCallback((placeholderText: string) => {
        return [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: placeholderText,
            }),
        ];
    }, []);

    const guidedSteps = useMemo<GuidedStep[]>(
        () => BASE_GUIDED_STEPS.map((step, index) => ({
            ...step,
            prompt: activeMode.guidedPrompts[index],
        })),
        [activeMode]
    );

    const editor = useEditor({
        immediatelyRender: false,
        extensions: buildEditorExtensions(editorPlaceholder),
        content: initialContent,
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(words);
        },
    });

    // Update placeholder when writingPrompt changes
    useEffect(() => {
        if (editor) {
            editor.setOptions({
                extensions: buildEditorExtensions(editorPlaceholder),
            });
        }
    }, [editor, editorPlaceholder, buildEditorExtensions]);

    const insertGuidedStep = useCallback((stepId: GuidedStepId) => {
        if (!editor) return;

        const step = guidedSteps.find((item) => item.id === stepId);
        if (!step) return;

        editor
            .chain()
            .focus()
            .insertContent(`<h3>${step.title}</h3><p>${step.prompt}</p><p></p>`)
            .run();

        setCompletedGuidedSteps((prev) => {
            if (prev.includes(stepId)) return prev;
            return [...prev, stepId];
        });
    }, [editor, guidedSteps]);

    const handleApplyModeTemplate = useCallback((force = false) => {
        if (!editor) return false;

        const currentContentLength = editor.getText().trim().length;
        const hasMeaningfulContent = currentContentLength > 20;
        if (hasMeaningfulContent && !force) {
            return false;
        }

        if (!title.trim()) {
            setTitle(activeMode.starterTitle);
        }

        setTags((prev) => {
            const normalized = prev.filter((tag) => !tag.startsWith("mode-"));
            const merged = [...activeMode.starterTags, ...normalized];
            return Array.from(new Set(merged)).slice(0, 10);
        });

        editor.commands.setContent(activeMode.templateHtml);
        setWordCount(editor.getText().trim().split(/\s+/).filter(Boolean).length);
        setCompletedGuidedSteps([]);
        return true;
    }, [activeMode, editor, title]);

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

        const modeTag = `mode-${journalMode}`;
        const cleanedTags = tags.filter((tag) => !tag.startsWith("mode-"));
        const finalTags = [modeTag, ...cleanedTags].slice(0, 10);

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
            tags: finalTags,
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
        journalMode,
        setJournalMode,
        modeOptions: JOURNAL_MODE_OPTIONS,
        activeMode,
        handleApplyModeTemplate,
        guidedSteps,
        completedGuidedSteps,
        insertGuidedStep,
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
