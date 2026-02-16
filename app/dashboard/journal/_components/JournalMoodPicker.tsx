import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { Smile } from "lucide-react";

interface JournalMoodPickerProps {
    selectedMoodId?: number;
    onSelectMood: (moodId: number) => void;
    moods: Array<{ id: number; emoji: string; label: string; color: string }>;
    isOpen: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

export function JournalMoodPicker({
    selectedMoodId,
    onSelectMood,
    moods,
    isOpen,
    onToggle,
    disabled = false,
}: JournalMoodPickerProps) {
    const selectedMood = moods.find((m) => m.id === selectedMoodId);

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className={cn(
                    "gap-2",
                    selectedMoodId && "border-primary text-primary bg-primary/5"
                )}
                disabled={disabled}
            >
                {selectedMood ? (
                    <>
                        <span className="text-lg">{selectedMood.emoji}</span>
                        {selectedMood.label}
                    </>
                ) : (
                    <>
                        <Smile className="w-4 h-4" />
                        Pilih Mood
                    </>
                )}
            </Button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[200px] grid grid-cols-3 gap-2">
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => {
                                onSelectMood(mood.id);
                                onToggle();
                            }}
                            className={cn(
                                "p-2 rounded hover:bg-gray-100 flex flex-col items-center gap-1",
                                selectedMoodId === mood.id && "bg-primary/10 text-primary"
                            )}
                        >
                            <span className="text-2xl">{mood.emoji}</span>
                            <span className="text-xs">{mood.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
