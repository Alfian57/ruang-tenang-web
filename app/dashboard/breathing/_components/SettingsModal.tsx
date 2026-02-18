"use client";

import { X, BookOpen, Bell, Clock } from "lucide-react";
import { cn } from "@/utils";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    voiceGuidance: boolean;
    setVoiceGuidance: (enabled: boolean) => void;
    hapticFeedback: boolean;
    setHapticFeedback: (enabled: boolean) => void;
    reminderEnabled?: boolean;
    onReminderToggle?: (enabled: boolean) => void;
    reminderTime?: string;
    onReminderTimeChange?: (time: string) => void;
    reminderDays?: string;
    onReminderDaysChange?: (days: string) => void;
    onReplayTutorial?: () => void;
}

const DAYS_OPTIONS = [
    { key: "senin", label: "Sen" },
    { key: "selasa", label: "Sel" },
    { key: "rabu", label: "Rab" },
    { key: "kamis", label: "Kam" },
    { key: "jumat", label: "Jum" },
    { key: "sabtu", label: "Sab" },
    { key: "minggu", label: "Min" },
];

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                enabled ? "bg-primary" : "bg-muted"
            )}
        >
            <div
                className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    enabled ? "translate-x-5" : "translate-x-1"
                )}
            />
        </button>
    );
}

export function SettingsModal({
    isOpen,
    onClose,
    voiceGuidance,
    setVoiceGuidance,
    hapticFeedback,
    setHapticFeedback,
    reminderEnabled = false,
    onReminderToggle,
    reminderTime = "08:00",
    onReminderTimeChange,
    reminderDays = "",
    onReminderDaysChange,
    onReplayTutorial,
}: SettingsModalProps) {
    if (!isOpen) return null;

    const selectedDays = reminderDays ? reminderDays.split(",").filter(Boolean) : [];

    const toggleDay = (day: string) => {
        const newDays = selectedDays.includes(day)
            ? selectedDays.filter((d) => d !== day)
            : [...selectedDays, day];
        onReminderDaysChange?.(newDays.join(","));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Pengaturan</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Session Defaults */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Sesi Default</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Panduan Suara</p>
                                    <p className="text-sm text-muted-foreground">Aktifkan panduan suara secara default</p>
                                </div>
                                <ToggleSwitch enabled={voiceGuidance} onToggle={() => setVoiceGuidance(!voiceGuidance)} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Getaran</p>
                                    <p className="text-sm text-muted-foreground">Aktifkan getaran secara default</p>
                                </div>
                                <ToggleSwitch enabled={hapticFeedback} onToggle={() => setHapticFeedback(!hapticFeedback)} />
                            </div>
                        </div>
                    </div>

                    {/* Reminder Settings */}
                    {onReminderToggle && (
                        <div className="border-t pt-5">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Bell className="w-3.5 h-3.5" /> Pengingat
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Pengingat Harian</p>
                                        <p className="text-sm text-muted-foreground">Ingatkan untuk latihan pernapasan</p>
                                    </div>
                                    <ToggleSwitch
                                        enabled={reminderEnabled}
                                        onToggle={() => onReminderToggle(!reminderEnabled)}
                                    />
                                </div>

                                {reminderEnabled && (
                                    <>
                                        {/* Time Picker */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <p className="font-medium text-sm">Waktu</p>
                                            </div>
                                            <input
                                                type="time"
                                                value={reminderTime}
                                                onChange={(e) => onReminderTimeChange?.(e.target.value)}
                                                className="px-3 py-1.5 rounded-lg bg-muted border-0 text-sm"
                                            />
                                        </div>

                                        {/* Day Selector */}
                                        <div>
                                            <p className="text-sm font-medium mb-2">Hari</p>
                                            <div className="flex gap-1.5">
                                                {DAYS_OPTIONS.map((day) => (
                                                    <button
                                                        key={day.key}
                                                        onClick={() => toggleDay(day.key)}
                                                        className={cn(
                                                            "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                                                            selectedDays.includes(day.key)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                        )}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Replay Tutorial */}
                    {onReplayTutorial && (
                        <div className="border-t pt-5">
                            <button
                                onClick={() => {
                                    onReplayTutorial();
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                            >
                                <BookOpen className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="font-medium">Putar Ulang Tutorial</p>
                                    <p className="text-sm text-muted-foreground">Lihat kembali panduan penggunaan</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
