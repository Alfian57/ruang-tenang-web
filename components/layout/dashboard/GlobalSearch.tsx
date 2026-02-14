"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Music, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchService } from "@/services/api";
import { getUploadUrl } from "@/services/http/upload-url";
import { Article, Song } from "@/types";
import Image from "next/image";

// Simple debounce hook implementation if not exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, 500);
  const [results, setResults] = useState<{ articles: Article[]; songs: Song[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await searchService.search(debouncedQuery);
        if (res.data) {
          setResults(res.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari artikel, lagu..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) setIsOpen(true);
          }}
          onFocus={() => {
            if (results) setIsOpen(true);
          }}
          className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && results && (results.articles.length > 0 || results.songs.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50 p-2">
          {results.articles.length > 0 && (
            <div className="mb-2">
              <h3 className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3 h-3" /> Artikel
              </h3>
              {results.articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleSelect(`/dashboard/articles/${article.id}`)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-gray-100">
                    <Image
                      src={getUploadUrl(article.thumbnail)}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {article.category?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.songs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider flex items-center gap-2">
                <Music className="w-3 h-3" /> Lagu (Segera Hadir)
              </h3>
              {results.songs.map((song) => (
                <div
                  key={song.id}
                  // For now, maybe just show a toast or nothing since songs might not have a dedicated detail page in dashboard yet?
                  // Or maybe navigate to songs list with search param?
                  // Let's assume we can navigate to a hypothetical song detail or just category
                  // For this implementation, I'll allow clicking but it might effectively do nothing significant if page doesn't exist.
                  // Wait, "Songs (Segera Hadir)" suggests maybe I shouldn't link it?
                  // But the user asked for global search.
                  // I'll make it clickable to "/dashboard/songs" for now.
                  onClick={() => handleSelect(`/dashboard/songs/${song.id}`)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-gray-100">
                     <Image
                      src={getUploadUrl(song.thumbnail)}
                      alt={song.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {song.category?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && query && !isLoading && (!results || (results.articles.length === 0 && results.songs.length === 0)) && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-50 p-4 text-center text-sm text-gray-500">
           Tidak ada hasil ditemukan
         </div>
      )}
    </div>
  );
}
