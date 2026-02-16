"use client";

import { BreathingTechnique, getTechniqueIcon, getDifficultyLabel, getCategoryLabel } from "@/types/breathing";
import { Star, Clock, Play, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/utils";

interface TechniqueCardProps {
    technique: BreathingTechnique;
    isSelected?: boolean;
    onSelect?: () => void;
    onFavoriteToggle?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
    compact?: boolean;
}

export function TechniqueCard({
    technique,
    isSelected,
    onSelect,
    onFavoriteToggle,
    onEdit,
    onDelete,
    showActions = false,
    compact = false,
}: TechniqueCardProps) {
    const totalCycle = technique.total_cycle_duration || (
        technique.inhale_duration +
        technique.inhale_hold_duration +
        technique.exhale_duration +
        technique.exhale_hold_duration
    );

    // Generate timing pattern display
    const pattern = [
        technique.inhale_duration,
        technique.inhale_hold_duration,
        technique.exhale_duration,
        technique.exhale_hold_duration,
    ].filter(d => d > 0).join("-");

    if (compact) {
        return (
            <button
                onClick={onSelect}
                className={cn(
                    "w-full p-3 rounded-xl border-2 transition-all duration-200 text-left",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted bg-card"
                )}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${technique.color}20`, color: technique.color }}
                    >
                        {getTechniqueIcon(technique)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{technique.name}</h4>
                        <p className="text-xs text-muted-foreground">{pattern}</p>
                    </div>
                    {onFavoriteToggle ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFavoriteToggle();
                            }}
                            className={cn(
                                "p-1.5 rounded-full hover:bg-muted transition-colors",
                                technique.is_favorite ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                            )}
                        >
                            <Star 
                                className={cn(
                                    "w-4 h-4 shrink-0", 
                                    technique.is_favorite && "fill-current"
                                )} 
                            />
                        </button>
                    ) : technique.is_favorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />
                    )}
                </div>
            </button>
        );
    }

    return (
        <div
            className={cn(
                "relative group rounded-xl border-2 transition-all duration-200 overflow-hidden",
                "hover:shadow-lg hover:border-primary/50",
                isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted bg-card"
            )}
        >
            {/* Header with color accent */}
            <div
                className="h-2"
                style={{ backgroundColor: technique.color }}
            />

            <div className="p-4">
                {/* Icon and Title */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${technique.color}20`, color: technique.color }}
                        >
                            {getTechniqueIcon(technique)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-base">{technique.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="px-2 py-0.5 rounded-full bg-muted">
                                    {getDifficultyLabel(technique.difficulty)}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-muted">
                                    {getCategoryLabel(technique.category)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Favorite button */}
                    {onFavoriteToggle && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onFavoriteToggle();
                            }}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                technique.is_favorite
                                    ? "text-yellow-500 hover:bg-yellow-100"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Star
                                className={cn(
                                    "w-5 h-5",
                                    technique.is_favorite && "fill-current"
                                )}
                            />
                        </button>
                    )}
                </div>

                {/* Description */}
                {technique.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {technique.description}
                    </p>
                )}

                {/* Pattern and Duration */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs"
                            style={{ backgroundColor: `${technique.color}20`, color: technique.color }}
                        >
                            {pattern}
                        </div>
                        <span className="text-muted-foreground">pattern</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{totalCycle}s / cycle</span>
                    </div>
                </div>

                {/* Best for */}
                {technique.best_for && (
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Cocok untuk:</span> {technique.best_for}
                    </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-muted">
                    {onSelect && (
                        <button
                            onClick={onSelect}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors",
                                isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                        >
                            <Play className="w-4 h-4" />
                            {isSelected ? "Dipilih" : "Mulai"}
                        </button>
                    )}

                    {showActions && !technique.is_system && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
