import { BreathingTechnique } from "@/types/breathing";
import { cn } from "@/utils";
import { TechniqueCard } from "./TechniqueCard";

interface TechniqueGridProps {
    techniques: BreathingTechnique[];
    selectedId?: string;
    onSelect?: (technique: BreathingTechnique) => void;
    onFavoriteToggle?: (technique: BreathingTechnique) => void;
    onEdit?: (technique: BreathingTechnique) => void;
    onDelete?: (technique: BreathingTechnique) => void;
    showActions?: boolean;
    compact?: boolean;
    columns?: 1 | 2 | 3 | 4;
}

export function TechniqueGrid({
    techniques,
    selectedId,
    onSelect,
    onFavoriteToggle,
    onEdit,
    onDelete,
    showActions = false,
    compact = false,
    columns = 2,
}: TechniqueGridProps) {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    };

    return (
        <div className={cn("grid gap-4", gridCols[columns])}>
            {techniques.map((technique) => (
                <TechniqueCard
                    key={technique.id}
                    technique={technique}
                    isSelected={selectedId === technique.id}
                    onSelect={onSelect ? () => onSelect(technique) : undefined}
                    onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(technique) : undefined}
                    onEdit={onEdit ? () => onEdit(technique) : undefined}
                    onDelete={onDelete ? () => onDelete(technique) : undefined}
                    showActions={showActions}
                    compact={compact}
                />
            ))}
        </div>
    );
}
