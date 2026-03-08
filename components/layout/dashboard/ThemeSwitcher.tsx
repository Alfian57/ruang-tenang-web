"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, Check, Loader2, Lock, Waves, Trees, Sunset, Paintbrush, type LucideIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { rewardService } from "@/services/api";

interface ThemeOption {
    key: string;
    label: string;
    icon: LucideIcon;
    colors: [string, string, string]; // 3 color swatches
    desc: string;
}

const THEMES: ThemeOption[] = [
    {
        key: "default",
        label: "Default",
        icon: Paintbrush,
        colors: ["#EF4444", "#FEE2E2", "#F9FAFB"],
        desc: "Tema standar",
    },
    {
        key: "ocean_calm",
        label: "Ocean Calm",
        icon: Waves,
        colors: ["#0EA5E9", "#BAE6FD", "#F0F9FF"],
        desc: "Laut tenang",
    },
    {
        key: "forest_zen",
        label: "Forest Zen",
        icon: Trees,
        colors: ["#16A34A", "#BBF7D0", "#F0FDF4"],
        desc: "Hutan damai",
    },
    {
        key: "sunset_warmth",
        label: "Sunset Warmth",
        icon: Sunset,
        colors: ["#EA580C", "#FED7AA", "#FFF7ED"],
        desc: "Senja hangat",
    },
];

export function ThemeSwitcher() {
    const { token, user, refreshUser } = useAuthStore();
    const [ownedThemes, setOwnedThemes] = useState<string[]>(["default"]);
    const [activeTheme, setActiveTheme] = useState<string>(user?.profile_theme || "default");
    const [activating, setActivating] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const fetchThemes = useCallback(async () => {
        if (!token) return;
        try {
            const res = await rewardService.getOwnedThemes(token);
            if (res.data) {
                setOwnedThemes(res.data.owned_themes || ["default"]);
                setActiveTheme(res.data.active_theme || "default");
            }
        } catch {
            // silently fail
        }
    }, [token]);

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]);

    useEffect(() => {
        if (user?.profile_theme) {
            setActiveTheme(user.profile_theme);
        }
    }, [user?.profile_theme]);

    const handleActivate = async (themeKey: string) => {
        if (!token || activating || themeKey === activeTheme) return;
        const isOwned = ownedThemes.includes(themeKey);
        if (!isOwned) {
            toast.error("Tema ini belum dibuka. Tukarkan koin di halaman Hadiah.");
            return;
        }

        setActivating(themeKey);
        try {
            await rewardService.activateTheme(token, themeKey);
            setActiveTheme(themeKey);
            const themeLabel = THEMES.find((t) => t.key === themeKey)?.label || themeKey;
            toast.success(`Tema "${themeLabel}" diaktifkan!`);
            refreshUser();
            setOpen(false);
        } catch {
            toast.error("Gagal mengaktifkan tema");
        } finally {
            setActivating(null);
        }
    };

    const currentTheme = THEMES.find((t) => t.key === activeTheme) || THEMES[0];
    const CurrentThemeIcon = currentTheme.icon;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm"
                    title="Ganti tema dashboard"
                >
                    <Palette className="w-4 h-4 text-gray-500" />
                    <CurrentThemeIcon className="hidden xl:inline w-4 h-4 text-gray-600" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
                <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tema Dashboard</p>
                </div>
                {THEMES.map((theme) => {
                    const ThemeIcon = theme.icon;
                    const isOwned = ownedThemes.includes(theme.key);
                    const isActive = activeTheme === theme.key;
                    const isLoading = activating === theme.key;

                    return (
                        <button
                            key={theme.key}
                            onClick={() => handleActivate(theme.key)}
                            disabled={isLoading || !isOwned || isActive}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                                isActive
                                    ? "bg-gray-100 ring-1 ring-gray-200"
                                    : isOwned
                                        ? "hover:bg-gray-50 cursor-pointer"
                                        : "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {/* Color swatches */}
                            <div className="flex -space-x-1 shrink-0">
                                {theme.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: color, zIndex: 3 - i }}
                                    />
                                ))}
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <ThemeIcon className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">{theme.label}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5">{theme.desc}</p>
                            </div>

                            {/* Status */}
                            <div className="shrink-0">
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : isActive ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : !isOwned ? (
                                    <Lock className="w-3.5 h-3.5 text-gray-300" />
                                ) : null}
                            </div>
                        </button>
                    );
                })}

                {/* Hint */}
                {ownedThemes.length < THEMES.length && (
                    <div className="mt-1 px-3 py-2 theme-accent-soft-bg rounded-lg">
                        <p className="text-[11px] theme-accent-text-dark">
                            Buka tema baru di halaman <strong>Klaim Hadiah</strong>
                        </p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
