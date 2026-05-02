"use client";

import { useState, useEffect } from "react";
import { Song, SongCategory } from "@/types";
import { searchService, songService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface UseAddSongsProps {
    open: boolean;
    onAddSongs: (songIds: number[]) => Promise<void>;
    onOpenChange: (open: boolean) => void;
}

export function useAddSongs({ open, onAddSongs, onOpenChange }: UseAddSongsProps) {
    const { token } = useAuthStore();
    const [categories, setCategories] = useState<SongCategory[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
    const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load categories when dialog opens
    useEffect(() => {
        if (open) {
            loadCategories();
            setSelectedSongs(new Set());
            setSearch("");
            setSearchResults([]);
        }
    }, [open]);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const response = (await songService.getCategories()) as {
                data: SongCategory[];
            };
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSongs = async (categoryId: number) => {
        if (expandedCategory === categoryId) {
            setExpandedCategory(null);
            return;
        }

        try {
            const category = categories.find((c) => c.id === categoryId);
            const categoryKey = category?.slug || categoryId;
            const response = (await songService.getSongsByCategory(categoryKey)) as {
                data: Song[];
            };
            setSongs(response.data || []);
            setExpandedCategory(categoryId);
        } catch (error) {
            console.error("Failed to load songs:", error);
        }
    };

    // Search songs
    useEffect(() => {
        if (!search.trim() || !token) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await searchService.search(search, undefined, token);
                setSearchResults(response.data?.songs || []);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, token]);

    const toggleSong = (songId: number) => {
        const newSelected = new Set(selectedSongs);
        if (newSelected.has(songId)) {
            newSelected.delete(songId);
        } else {
            newSelected.add(songId);
        }
        setSelectedSongs(newSelected);
    };

    const handleSave = async () => {
        if (selectedSongs.size === 0) return;

        setIsSaving(true);
        try {
            await onAddSongs(Array.from(selectedSongs));
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to add songs:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        categories,
        songs,
        expandedCategory,
        selectedSongs,
        isLoading,
        isSaving,
        search,
        searchResults,
        isSearching,
        setSearch,
        loadSongs,
        toggleSong,
        handleSave,
    };
}
