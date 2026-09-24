import { useEffect, useState } from "react";
import { JournalSettings } from "@/types";
import {
    Eye,
    EyeOff,
    Shield,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TRUST_CUES } from "@/constants";
import { cn } from "@/utils";

interface JournalPrivacySettingsProps {
    settings: JournalSettings;
    onUpdate: (data: Partial<JournalSettings>) => void;
    isSaving?: boolean;
}

// Toggle Switch Component
function ToggleSwitch({
    enabled,
    onChange,
    disabled,
    label,
}: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            aria-pressed={enabled}
            aria-label={label}
            className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-accent/20",
                enabled ? "bg-primary" : "bg-gray-200",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
        >
            <span
                className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
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

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

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
        <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm">
            <CardHeader className="p-0 sm:p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2.5 p-3 text-left transition-colors hover:bg-theme-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent sm:px-4 sm:py-3"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                >
                    <span className="flex min-w-0 items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                            <Shield className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="text-base font-semibold leading-tight text-slate-900">Pengaturan privasi AI</span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">Kendalikan akses AI ke jurnalmu</span>
                        </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                        <span className={cn(
                            "hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex",
                            localSettings.allow_ai_access ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                            {localSettings.allow_ai_access ? "AI aktif" : "AI nonaktif"}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </span>
                </button>
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-4 border-t border-slate-100 pt-4 sm:space-y-5 sm:pt-5">
                    <div className="rounded-2xl border border-theme-accent-border-soft bg-[linear-gradient(120deg,var(--theme-accent-soft),white)] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme-accent-dark">
                            Privasi & Batasan AI
                        </p>
                        <div className="mt-2 space-y-1 text-sm leading-relaxed text-slate-600">
                            <p>{TRUST_CUES.PRIVACY}</p>
                            <p>{TRUST_CUES.CONSENT}</p>
                            <p>{TRUST_CUES.LIMITATION}</p>
                        </div>
                    </div>

                    {/* Master AI Access Toggle */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                {localSettings.allow_ai_access ? (
                                    <Eye className="w-5 h-5 text-primary/80 mt-0.5 shrink-0" />
                                ) : (
                                    <EyeOff className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 sm:text-base">
                                        Izinkan AI Membaca Jurnal
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
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
                                label="Izinkan AI membaca jurnal"
                            />
                        </div>
                    </div>

                    {/* Warning when AI access is enabled */}
                    {localSettings.allow_ai_access && (
                        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                                <p className="text-sm leading-relaxed text-amber-900">
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
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">Default bagikan ke AI</p>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                        Jurnal baru secara default akan dibagikan ke AI
                                        </p>
                                    </div>
                                    <ToggleSwitch
                                        enabled={localSettings.default_share_with_ai}
                                        onChange={handleToggleDefaultShare}
                                        disabled={isSaving}
                                        label="Bagikan jurnal baru ke AI secara default"
                                    />
                                </div>
                            </div>

                            {/* Context Settings */}
                            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                                    <Label htmlFor="journal-ai-context-days" className="text-sm font-semibold text-slate-900">Rentang waktu konteks</Label>
                                    <p className="mb-3 mt-1 text-xs leading-relaxed text-slate-500">
                                        Jurnal dari berapa hari terakhir yang dapat dibaca AI
                                    </p>
                                    <Input
                                        id="journal-ai-context-days"
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={localSettings.ai_context_days}
                                        onChange={(e) => handleContextDaysChange(parseInt(e.target.value) || 7)}
                                        disabled={isSaving}
                                        className="w-full"
                                    />
                                    <span className="mt-1 block text-xs text-slate-500">hari terakhir</span>
                                </div>
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                                    <Label htmlFor="journal-ai-context-max-entries" className="text-sm font-semibold text-slate-900">Maks. jurnal dibaca</Label>
                                    <p className="mb-3 mt-1 text-xs leading-relaxed text-slate-500">
                                        Jumlah maksimal jurnal yang dapat dibaca AI
                                    </p>
                                    <Input
                                        id="journal-ai-context-max-entries"
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={localSettings.ai_context_max_entries}
                                        onChange={(e) => handleMaxEntriesChange(parseInt(e.target.value) || 5)}
                                        disabled={isSaving}
                                        className="w-full"
                                    />
                                    <span className="mt-1 block text-xs text-slate-500">jurnal</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
