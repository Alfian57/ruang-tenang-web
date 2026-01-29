"use client";

import * as React from "react";
import { AlertTriangle, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Trigger warning display names in Indonesian
const TRIGGER_WARNING_LABELS: Record<string, string> = {
    self_harm: "Menyakiti Diri Sendiri",
    suicide: "Bunuh Diri",
    depression: "Depresi",
    anxiety: "Kecemasan",
    abuse: "Kekerasan/Pelecehan",
    violence: "Kekerasan",
    eating_disorder: "Gangguan Makan",
    substance_abuse: "Penyalahgunaan Zat",
    trauma: "Trauma",
    death: "Kematian",
    other: "Konten Sensitif Lainnya",
};

interface ContentWarningProps {
    triggerWarnings: string[];
    title?: string;
    className?: string;
    children: React.ReactNode;
    preference?: "show" | "hide_all" | "ask_each_time";
    onPreferenceChange?: (preference: "show" | "hide_all" | "ask_each_time") => void;
}

export function ContentWarning({
    triggerWarnings,
    title,
    className,
    children,
    preference = "ask_each_time",
    onPreferenceChange,
}: ContentWarningProps) {
    const [isRevealed, setIsRevealed] = React.useState(preference === "show");
    const [showPreferenceOptions, setShowPreferenceOptions] = React.useState(false);

    // If no warnings, just show content
    if (!triggerWarnings || triggerWarnings.length === 0) {
        return <>{children}</>;
    }

    // If preference is to show all, show content directly
    if (preference === "show") {
        return (
            <div className={className}>
                <ContentWarningBanner
                    triggerWarnings={triggerWarnings}
                    isCompact
                />
                {children}
            </div>
        );
    }

    // If preference is to hide all, show blurred content with option to reveal
    if (preference === "hide_all" && !isRevealed) {
        return (
            <ContentWarningOverlay
                triggerWarnings={triggerWarnings}
                title={title}
                className={className}
                onReveal={() => setIsRevealed(true)}
                showPreferenceOptions={showPreferenceOptions}
                onTogglePreferences={() => setShowPreferenceOptions(!showPreferenceOptions)}
                onPreferenceChange={onPreferenceChange}
            >
                {children}
            </ContentWarningOverlay>
        );
    }

    // Ask each time - show overlay until user chooses to reveal
    if (!isRevealed) {
        return (
            <ContentWarningOverlay
                triggerWarnings={triggerWarnings}
                title={title}
                className={className}
                onReveal={() => setIsRevealed(true)}
                showPreferenceOptions={showPreferenceOptions}
                onTogglePreferences={() => setShowPreferenceOptions(!showPreferenceOptions)}
                onPreferenceChange={onPreferenceChange}
            >
                {children}
            </ContentWarningOverlay>
        );
    }

    // Content is revealed
    return (
        <div className={className}>
            <ContentWarningBanner
                triggerWarnings={triggerWarnings}
                isCompact
                onHide={() => setIsRevealed(false)}
            />
            {children}
        </div>
    );
}

// Banner shown when content is revealed
interface ContentWarningBannerProps {
    triggerWarnings: string[];
    isCompact?: boolean;
    onHide?: () => void;
}

function ContentWarningBanner({ triggerWarnings, isCompact, onHide }: ContentWarningBannerProps) {
    return (
        <div className={cn(
            "flex items-center gap-2 p-2 mb-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800",
            isCompact && "p-2"
        )}>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Peringatan Konten:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                    {triggerWarnings.map((warning) => (
                        <span
                            key={warning}
                            className="inline-block px-1.5 py-0.5 text-xs rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                        >
                            {TRIGGER_WARNING_LABELS[warning] || warning}
                        </span>
                    ))}
                </div>
            </div>
            {onHide && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHide}
                    className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                >
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Sembunyikan</span>
                </Button>
            )}
        </div>
    );
}

// Overlay shown when content is hidden
interface ContentWarningOverlayProps {
    triggerWarnings: string[];
    title?: string;
    className?: string;
    children: React.ReactNode;
    onReveal: () => void;
    showPreferenceOptions: boolean;
    onTogglePreferences: () => void;
    onPreferenceChange?: (preference: "show" | "hide_all" | "ask_each_time") => void;
}

function ContentWarningOverlay({
    triggerWarnings,
    title,
    className,
    children,
    onReveal,
    showPreferenceOptions,
    onTogglePreferences,
    onPreferenceChange,
}: ContentWarningOverlayProps) {
    return (
        <div className={cn("relative", className)}>
            {/* Blurred background content */}
            <div className="blur-lg select-none pointer-events-none opacity-50" aria-hidden="true">
                {children}
            </div>

            {/* Warning overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="max-w-md mx-auto p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">Peringatan Konten</h3>

                    {title && (
                        <p className="text-sm text-muted-foreground mb-3">
                            &ldquo;{title}&rdquo;
                        </p>
                    )}

                    <p className="text-sm text-muted-foreground mb-4">
                        Konten ini mungkin berisi materi yang sensitif atau memicu:
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {triggerWarnings.map((warning) => (
                            <span
                                key={warning}
                                className="inline-block px-2 py-1 text-sm rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                            >
                                {TRIGGER_WARNING_LABELS[warning] || warning}
                            </span>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <Button onClick={onReveal} className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Tampilkan Konten
                        </Button>

                        {onPreferenceChange && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onTogglePreferences}
                                    className="text-muted-foreground"
                                >
                                    {showPreferenceOptions ? "Sembunyikan opsi" : "Ubah preferensi"}
                                </Button>

                                {showPreferenceOptions && (
                                    <div className="p-3 bg-muted rounded-lg text-left space-y-2">
                                        <p className="text-xs font-medium mb-2">Preferensi peringatan konten:</p>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="content-warning-pref"
                                                onChange={() => onPreferenceChange("ask_each_time")}
                                                className="accent-primary"
                                            />
                                            Tanya setiap kali
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="content-warning-pref"
                                                onChange={() => onPreferenceChange("show")}
                                                className="accent-primary"
                                            />
                                            Selalu tampilkan
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="content-warning-pref"
                                                onChange={() => onPreferenceChange("hide_all")}
                                                className="accent-primary"
                                            />
                                            Selalu sembunyikan
                                        </label>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple inline warning badge
interface TriggerWarningBadgeProps {
    warnings: string[];
    className?: string;
}

export function TriggerWarningBadge({ warnings, className }: TriggerWarningBadgeProps) {
    if (!warnings || warnings.length === 0) return null;

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
                Peringatan Konten
            </span>
        </div>
    );
}
