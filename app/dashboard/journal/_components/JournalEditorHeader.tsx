import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface JournalEditorHeaderProps {
    title: string;
    setTitle: (title: string) => void;
    onBack?: () => void;
    isSaving?: boolean;
}

export function JournalEditorHeader({
    title,
    setTitle,
    onBack,
    isSaving = false,
}: JournalEditorHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div className="flex items-center gap-4 mb-6">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={isSaving}
            >
                <ChevronLeft className="w-6 h-6" />
            </Button>
            <Input
                type="text"
                placeholder="Judul Jurnal..."
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
            />
        </div>
    );
}
