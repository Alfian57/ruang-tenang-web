"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Music, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useDebounce } from "@/hooks/use-debounce";
import { ROUTES } from "@/lib/routes";
import { searchService } from "@/services/api";
import type { Article, Song, UserRole } from "@/types";
import {
  getDashboardSearchEntries,
  getGlobalSearchEmptyHint,
  getGlobalSearchPlaceholder,
} from "./global-search-config";

export type GlobalSearchResultType = "route" | "article" | "song";

export interface GlobalSearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  type: GlobalSearchResultType;
  section: string;
  thumbnail?: string;
}

export interface GlobalSearchSection {
  title: string;
  icon: LucideIcon;
  results: GlobalSearchResult[];
}

interface UserSearchResults {
  articles: Article[];
  songs: Song[];
}

function articleToResult(article: Article): GlobalSearchResult {
  return {
    id: `article-${article.id}`,
    title: article.title,
    description: article.category?.name || "Artikel",
    href: ROUTES.articleRead(article.slug || String(article.id)),
    icon: FileText,
    type: "article",
    section: "Artikel",
    thumbnail: article.thumbnail,
  };
}

function songToResult(song: Song): GlobalSearchResult {
  const search = new URLSearchParams({ search: song.title }).toString();

  return {
    id: `song-${song.id}`,
    title: song.title,
    description: song.category?.name || "Buka di halaman Musik",
    href: `${ROUTES.MUSIC}?${search}`,
    icon: Music,
    type: "song",
    section: "Musik",
    thumbnail: song.thumbnail,
  };
}

function roleCanSearchContent(role?: UserRole | null): role is "user" {
  return role === "user";
}

export function useGlobalSearch() {
  const { user, token } = useAuth();
  const role = user?.role;
  const [query, setQuery] = useState("");
  const [contentResults, setContentResults] = useState<UserSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  const routeResults = useMemo<GlobalSearchResult[]>(() => {
    if (!role) return [];

    return getDashboardSearchEntries(role, query).map((entry) => ({
      id: `route-${entry.id}`,
      title: entry.title,
      description: entry.description,
      href: entry.href,
      icon: entry.icon,
      type: "route",
      section: entry.section,
    }));
  }, [query, role]);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (!trimmedQuery || !token || !roleCanSearchContent(role)) {
      setContentResults(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setContentResults(null);

    searchService
      .search(trimmedQuery, { limit: 5 }, token)
      .then((res) => {
        if (!isActive) return;

        setContentResults({
          articles: res.data?.articles || [],
          songs: res.data?.songs || [],
        });
        setIsOpen(true);
      })
      .catch((error) => {
        if (!isActive) return;
        console.error("Search failed:", error);
        setContentResults({ articles: [], songs: [] });
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [debouncedQuery, role, token]);

  const sections = useMemo<GlobalSearchSection[]>(() => {
    const routeSection: GlobalSearchSection | null = routeResults.length > 0
      ? {
          title: role === "user" ? "Menu" : "Area tersedia",
          icon: routeResults[0].icon,
          results: routeResults,
        }
      : null;

    const articleResults = contentResults?.articles.map(articleToResult) || [];
    const songResults = contentResults?.songs.map(songToResult) || [];

    return [
      routeSection,
      articleResults.length > 0
        ? { title: "Artikel", icon: FileText, results: articleResults }
        : null,
      songResults.length > 0
        ? { title: "Musik", icon: Music, results: songResults }
        : null,
    ].filter(Boolean) as GlobalSearchSection[];
  }, [contentResults, role, routeResults]);

  const hasResults = sections.some((section) => section.results.length > 0);
  const placeholder = getGlobalSearchPlaceholder(role);
  const emptyHint = getGlobalSearchEmptyHint(role);

  return {
    query,
    setQuery,
    isLoading,
    isOpen,
    setIsOpen,
    sections,
    hasResults,
    placeholder,
    emptyHint,
  };
}
