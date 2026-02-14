"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    voiceGuidance: boolean;
    setVoiceGuidance: (enabled: boolean) => void;
    hapticFeedback: boolean;
    setHapticFeedback: (enabled: boolean) => void;
}

export function SettingsModal({
    isOpen,
    onClose,
    voiceGuidance,
    setVoiceGuidance,
    hapticFeedback,
    setHapticFeedback,
}: SettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Pengaturan</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Panduan Suara Default</p>
                            <p className="text-sm text-muted-foreground">Aktifkan panduan suara secara default</p>
                        </div>
                        <button
                            onClick={() => setVoiceGuidance(!voiceGuidance)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative",
                                voiceGuidance ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    voiceGuidance ? "translate-x-5" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Getaran Default</p>
                            <p className="text-sm text-muted-foreground">Aktifkan getaran secara default</p>
                        </div>
                        <button
                            onClick={() => setHapticFeedback(!hapticFeedback)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative",
                                hapticFeedback ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    hapticFeedback ? "translate-x-5" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
