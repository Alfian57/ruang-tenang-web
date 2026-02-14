"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { storyService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { StoryCard, StoryCategory } from "@/types";

export default function StoriesPage() {
  const router = useRouter();
  useAuthStore();
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [featuredStories, setFeaturedStories] = useState<StoryCard[]>([]);
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // URL state management
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Read from URL
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const sortBy = (searchParams.get("sort") || "recent") as "recent" | "hearts" | "featured";

  const setSearchQuery = (value: string) => updateUrlParam("search", value || null);
  const setSelectedCategory = (value: string) => updateUrlParam("category", value === "all" ? null : value);
  const setSortBy = (value: "recent" | "hearts" | "featured") => updateUrlParam("sort", value === "recent" ? null : value);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await storyService.getStories({
        page,
        limit: 12,
        sort_by: sortBy,
        category_id: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (response.data) {
        setStories(response.data);
        setTotalPages(response.meta?.total_pages || 1);
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, searchQuery]);

  const loadFeaturedStories = useCallback(async () => {
    try {
      const response = await storyService.getFeatured();
      if (response.data) {
        setFeaturedStories(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load featured stories:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await storyService.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadFeaturedStories();
  }, [loadCategories, loadFeaturedStories]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-8">
        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Kisah Pilihan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/dashboard/stories/${story.id}`}
                  className="group relative bg-gradient-to-br from-amber-100 to-orange-50 rounded-2xl overflow-hidden border border-amber-200 hover:shadow-lg transition-all"
                >
                  {story.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <Image
                        src={story.cover_image}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <Badge className="bg-amber-500 text-white mb-2">Featured</Badge>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {story.is_anonymous ? (
                          <User className="w-4 h-4" />
                        ) : (
                          story.author?.name
                        )}
                        {story.is_anonymous && "Anonim"}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-rose-500" />
                          {story.heart_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                placeholder="Cari kisah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "hearts" | "featured")}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Terbaru</SelectItem>
                <SelectItem value="hearts">Paling Disukai</SelectItem>
                <SelectItem value="featured">Kisah Pilihan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Stories Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border animate-pulse h-64"
              />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum ada kisah</h3>
            <p className="text-gray-500 mb-4">
              Jadilah yang pertama berbagi kisah inspiratif!
            </p>
            <Button
              onClick={() => router.push("/dashboard/stories/new")}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Tulis Kisah
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/dashboard/stories/${story.id}`}
                  className="group bg-white rounded-xl border hover:shadow-lg transition-all overflow-hidden"
                >
                  {story.cover_image && (
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <Image
                        src={story.cover_image}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {story.has_trigger_warning && (
                      <Badge variant="destructive" className="mb-2 gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Trigger Warning
                      </Badge>
                    )}
                    <h3 className="font-bold text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {story.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.categories?.slice(0, 2).map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat.icon} {cat.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        {story.is_anonymous ? (
                          <>
                            <User className="w-4 h-4" />
                            <span>Anonim</span>
                          </>
                        ) : (
                          <span>{story.author?.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {story.heart_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {story.comment_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Halaman {page} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
