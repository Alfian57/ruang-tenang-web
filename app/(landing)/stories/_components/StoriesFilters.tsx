"use client";

import { Search, Filter, TrendingUp, Heart, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StoryCategory } from "@/types";

const SORT_OPTIONS = [
    { value: "recent" as const, label: "Terbaru", icon: Clock },
    { value: "hearts" as const, label: "Paling Disukai", icon: Heart },
    { value: "featured" as const, label: "Pilihan Editor", icon: Star },
];

interface StoriesFiltersProps {
    searchQuery: string;
    selectedCategory: string | null;
    sortBy: "recent" | "hearts" | "featured";
    categories: StoryCategory[];
    onSearchChange: (value: string) => void;
    onCategoryChange: (id: string | null) => void;
    onSortChange: (sort: "recent" | "hearts" | "featured") => void;
    onSearchSubmit: (e: React.FormEvent) => void;
}

export function StoriesFilters({
    searchQuery,
    selectedCategory,
    sortBy,
    categories,
    onSearchChange,
    onCategoryChange,
    onSortChange,
    onSearchSubmit,
}: StoriesFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <form onSubmit={onSearchSubmit} className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari cerita..."
                        className="pl-10"
                    />
                </div>
            </form>

            {/* Category Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        {selectedCategory
                            ? categories.find((c) => c.id === selectedCategory)?.name || "Kategori"
                            : "Semua Kategori"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onCategoryChange(null)}>
                        Semua Kategori
                    </DropdownMenuItem>
                    {categories.map((category) => (
                        <DropdownMenuItem
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                        >
                            {category.icon} {category.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {SORT_OPTIONS.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                        >
                            <option.icon className="h-4 w-4 mr-2" />
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
