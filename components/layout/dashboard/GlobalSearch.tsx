"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { getUploadUrl } from "@/services/http/upload-url";
import { useGlobalSearch } from "./useGlobalSearch";

export function GlobalSearch() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    query,
    setQuery,
    isLoading,
    isOpen,
    setIsOpen,
    sections,
    hasResults,
    placeholder,
    emptyHint,
  } = useGlobalSearch();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(event.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          className="w-full rounded-full border-none bg-gray-100 py-2 pl-9 pr-9 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {showDropdown && hasResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
          {sections.map((section) => (
            <div key={section.title} className="mb-2 last:mb-0">
              <h3 className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <section.icon className="h-3 w-3" />
                {section.title}
              </h3>
              {section.results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result.href)}
                  className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                >
                  {result.thumbnail ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={getUploadUrl(result.thumbnail)}
                        alt={result.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <result.icon className="h-4 w-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary">
                      {result.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-gray-500">
                      {result.description}
                    </p>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-primary" />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {showDropdown && !isLoading && !hasResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-100 bg-white p-4 text-center text-sm text-gray-500 shadow-lg">
          <p className="font-medium text-gray-700">Tidak ada hasil untuk kata kunci ini</p>
          <p className="mt-1 text-xs text-gray-500">{emptyHint}</p>
        </div>
      )}
    </div>
  );
}
