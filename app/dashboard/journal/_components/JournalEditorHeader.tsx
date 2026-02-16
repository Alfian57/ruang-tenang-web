import { Input } from "@/components/ui/input";

interface JournalEditorHeaderProps {
    title: string;
    setTitle: (title: string) => void;
    isSaving?: boolean;
}

export function JournalEditorHeader({
    title,
    setTitle,
    isSaving = false,
}: JournalEditorHeaderProps) {

    return (
        <div className="mb-6">
            <Input
                type="text"
                placeholder="Judul Jurnal..."
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-4 h-auto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
            />
        </div>
    );
}
