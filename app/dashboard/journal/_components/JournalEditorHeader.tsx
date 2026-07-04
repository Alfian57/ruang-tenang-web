import { Input } from "@/components/ui/input";

interface JournalEditorHeaderProps {
    title: string;
    setTitle: (title: string) => void;
    isSaving?: boolean;
    error?: string;
}

export function JournalEditorHeader({
    title,
    setTitle,
    isSaving = false,
    error,
}: JournalEditorHeaderProps) {

    return (
        <div className="mb-6 space-y-2">
            <Input
                id="journal-title"
                type="text"
                placeholder="Judul Jurnal..."
                className={`text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-4 h-auto ${error ? 'border-red-500 focus-visible:ring-red-500 ring-1 ring-red-500 rounded-lg' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
            />
            {error && (
                <p className="text-sm text-red-500 font-medium px-4">{error}</p>
            )}
        </div>
    );
}
