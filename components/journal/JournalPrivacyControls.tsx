"use client";

import { useState } from "react";
import { JournalSettings, JournalAIAccessLog, JournalAIContext } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
    Eye,
    EyeOff,
    Settings,
    History,
    Shield,
    AlertTriangle,
    Info,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface JournalPrivacySettingsProps {
    settings: JournalSettings;
    onUpdate: (data: Partial<JournalSettings>) => void;
    isSaving?: boolean;
}

interface JournalAIAccessLogsProps {
    logs: JournalAIAccessLog[];
    isLoading?: boolean;
}

interface JournalAIContextPreviewProps {
    context: JournalAIContext | null;
    isLoading?: boolean;
}

// Toggle Switch Component
function ToggleSwitch({
    enabled,
    onChange,
    disabled,
}: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                enabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    enabled ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}

export function JournalPrivacySettings({
    settings,
    onUpdate,
    isSaving = false,
}: JournalPrivacySettingsProps) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleAIAccess = () => {
        const newValue = !localSettings.allow_ai_access;
        setLocalSettings({ ...localSettings, allow_ai_access: newValue });
        onUpdate({ allow_ai_access: newValue });
    };

    const handleToggleDefaultShare = () => {
        const newValue = !localSettings.default_share_with_ai;
        setLocalSettings({ ...localSettings, default_share_with_ai: newValue });
        onUpdate({ default_share_with_ai: newValue });
    };

    const handleContextDaysChange = (value: number) => {
        setLocalSettings({ ...localSettings, ai_context_days: value });
        onUpdate({ ai_context_days: value });
    };

    const handleMaxEntriesChange = (value: number) => {
        setLocalSettings({ ...localSettings, ai_context_max_entries: value });
        onUpdate({ ai_context_max_entries: value });
    };

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Pengaturan Privasi AI</CardTitle>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-6">
                    {/* Master AI Access Toggle */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                {localSettings.allow_ai_access ? (
                                    <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
                                ) : (
                                    <EyeOff className="w-5 h-5 text-gray-500 mt-0.5" />
                                )}
                                <div>
                                    <Label className="text-base font-medium">
                                        Izinkan AI Membaca Jurnal
                                    </Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {localSettings.allow_ai_access
                                            ? "AI chatbot dapat membaca jurnal yang kamu bagikan untuk memberikan respons yang lebih personal."
                                            : "AI chatbot tidak dapat membaca jurnalmu sama sekali."}
                                    </p>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={localSettings.allow_ai_access}
                                onChange={handleToggleAIAccess}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Warning when AI access is enabled */}
                    {localSettings.allow_ai_access && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    AI hanya dapat membaca jurnal yang{" "}
                                    <strong>secara spesifik kamu bagikan</strong>. Jurnal dengan status
                                    &ldquo;AI tidak dapat membaca&rdquo; tetap tidak akan diakses.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Additional Settings */}
                    {localSettings.allow_ai_access && (
                        <>
                            {/* Default Share Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="font-medium">Default Bagikan ke AI</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Jurnal baru secara default akan dibagikan ke AI
                                    </p>
                                </div>
                                <ToggleSwitch
                                    enabled={localSettings.default_share_with_ai}
                                    onChange={handleToggleDefaultShare}
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Context Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-medium">Rentang Waktu Konteks</Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Jurnal dari berapa hari terakhir yang dapat dibaca AI
                                    </p>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={localSettings.ai_context_days}
                                        onChange={(e) => handleContextDaysChange(parseInt(e.target.value) || 7)}
                                        disabled={isSaving}
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-500">hari</span>
                                </div>
                                <div>
                                    <Label className="font-medium">Maks. Jurnal Dibaca</Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Jumlah maksimal jurnal yang dapat dibaca AI
                                    </p>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={localSettings.ai_context_max_entries}
                                        onChange={(e) => handleMaxEntriesChange(parseInt(e.target.value) || 5)}
                                        disabled={isSaving}
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-500">entri</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

export function JournalAIAccessLogs({ logs, isLoading = false }: JournalAIAccessLogsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary animate-spin" />
                        <CardTitle className="text-lg">Memuat log akses...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Log Akses AI</CardTitle>
                        <span className="text-sm text-gray-500">({logs.length} akses)</span>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    {logs.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Belum ada log akses AI.
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-auto">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            {log.journal?.title || `Jurnal #${log.journal_id}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Konteks: {log.context_type}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(log.accessed_at), {
                                            addSuffix: true,
                                            locale: id,
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

export function JournalAIContextPreview({
    context,
    isLoading = false,
}: JournalAIContextPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary animate-spin" />
                        <CardTitle className="text-lg">Memuat konteks...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (!context) return null;

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Yang AI Bisa Baca</CardTitle>
                        <span className="text-sm text-gray-500">
                            ({context.total_shared} jurnal dibagikan)
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    {context.journals.length === 0 ? (
                        <div className="text-center py-4">
                            <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                AI tidak dapat membaca jurnal apapun saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {context.journals.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {entry.mood_emoji && (
                                            <span className="text-sm">{entry.mood_emoji}</span>
                                        )}
                                        <p className="font-medium text-sm">{entry.title}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {entry.content_preview}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span>
                                            {format(new Date(entry.created_at), "d MMM yyyy", { locale: id })}
                                        </span>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{entry.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
