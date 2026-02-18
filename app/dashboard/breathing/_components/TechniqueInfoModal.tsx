"use client";

import { BreathingTechnique, getTechniqueIcon, getDifficultyLabel, getCategoryLabel } from "@/types/breathing";
import { X, Clock, Zap, Target, BookOpen } from "lucide-react";

interface TechniqueInfoModalProps {
    isOpen: boolean;
    technique: BreathingTechnique | null;
    onClose: () => void;
    onStart: () => void;
}

export function TechniqueInfoModal({ isOpen, technique, onClose, onStart }: TechniqueInfoModalProps) {
    if (!isOpen || !technique) return null;

    const cycleDuration = technique.inhale_duration + technique.inhale_hold_duration + technique.exhale_duration + technique.exhale_hold_duration;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTechniqueIcon(technique)}</span>
                        <div>
                            <h3 className="font-bold text-lg">{technique.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="px-2 py-0.5 rounded-full bg-muted">{getDifficultyLabel(technique.difficulty)}</span>
                                <span className="px-2 py-0.5 rounded-full bg-muted">{getCategoryLabel(technique.category)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Description */}
                    {technique.description && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-sm">Deskripsi</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{technique.description}</p>
                        </div>
                    )}

                    {/* Timing Diagram */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <h4 className="font-semibold text-sm">Pola Pernapasan</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-200/50">
                                <div className="text-2xl font-bold text-blue-600">{technique.inhale_duration}</div>
                                <div className="text-[10px] text-blue-600 font-medium mt-1">Tarik Napas</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-200/50">
                                <div className="text-2xl font-bold text-amber-600">{technique.inhale_hold_duration}</div>
                                <div className="text-[10px] text-amber-600 font-medium mt-1">Tahan</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-200/50">
                                <div className="text-2xl font-bold text-green-600">{technique.exhale_duration}</div>
                                <div className="text-[10px] text-green-600 font-medium mt-1">Hembuskan</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-200/50">
                                <div className="text-2xl font-bold text-purple-600">{technique.exhale_hold_duration}</div>
                                <div className="text-[10px] text-purple-600 font-medium mt-1">Tahan</div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            1 siklus = {cycleDuration} detik
                        </p>
                    </div>

                    {/* Benefits */}
                    {technique.benefits && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <h4 className="font-semibold text-sm">Manfaat</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{technique.benefits}</p>
                        </div>
                    )}

                    {/* Best For */}
                    {technique.best_for && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-green-500" />
                                <h4 className="font-semibold text-sm">Terbaik Untuk</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{technique.best_for}</p>
                        </div>
                    )}

                    {/* Origin */}
                    {technique.origin && (
                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                            <span className="font-medium">Asal: </span>
                            <span className="text-muted-foreground">{technique.origin}</span>
                        </div>
                    )}

                    {/* Start Button */}
                    <button
                        onClick={onStart}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Mulai Latihan
                    </button>
                </div>
            </div>
        </div>
    );
}
