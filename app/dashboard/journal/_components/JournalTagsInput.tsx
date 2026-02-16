import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X, Plus } from "lucide-react";

interface JournalTagsInputProps {
    tags: string[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onAddTag: () => void;
    onRemoveTag: (tag: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    disabled?: boolean;
}

export function JournalTagsInput({
    tags,
    inputValue,
    onInputChange,
    onAddTag,
    onRemoveTag,
    onKeyDown,
    disabled = false,
}: JournalTagsInputProps) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                        #{tag}
                        <button
                            onClick={() => onRemoveTag(tag)}
                            className="hover:text-red-500"
                            disabled={disabled}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tambah tags (pisahkan dengan koma)..."
                        className="pl-9"
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={disabled || tags.length >= 10}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddTag}
                    disabled={!inputValue.trim() || disabled || tags.length >= 10}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-xs text-gray-400">
                Maksimal 10 tags per jurnal
            </p>
        </div>
    );
}
