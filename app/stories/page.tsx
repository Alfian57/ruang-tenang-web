"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { storyService } from "@/services/api";
import { Navbar, Footer } from "@/components/layout";
import { useAuthStore } from "@/store/authStore";
import { StoryList } from "@/components/shared/stories";
import { StoryCard as StoryCardType, StoryCategory, StoryStats } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Search,
    Plus,
    Filter,
    Star,
    Heart,
    TrendingUp,
    Clock,
    LogIn,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StoriesPage() {
    const { token, user } = useAuthStore();
    const [stories, setStories] = useState<StoryCardType[]>([]);
    const [featuredStories, setFeaturedStories] = useState<StoryCardType[]>([]);
    const [categories, setCategories] = useState<StoryCategory[]>([]);
    const [myStats, setMyStats] = useState<StoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"recent" | "hearts" | "featured">("recent");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, featuredRes] = await Promise.all([
                    storyService.getCategories(),
                    storyService.getFeatured().catch(() => ({ data: [] })),
                ]);

                setCategories(categoriesRes.data || []);
                setFeaturedStories(featuredRes.data || []);

                if (token) {
                    const statsRes = await storyService.getMyStats(token).catch(() => null);
                    if (statsRes?.data) setMyStats(statsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };

        fetchInitialData();
    }, [token]);

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            try {
                const response = await storyService.getStories({
                    category_id: selectedCategory || undefined,
                    search: searchQuery || undefined,
                    sort_by: sortBy,
                    page,
                    limit: 12,
                });

                setStories(response.data || []);
                setTotalPages(response.meta?.total_pages || 1);
            } catch (error) {
                console.error("Failed to fetch stories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [selectedCategory, searchQuery, sortBy, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const sortOptions = [
        { value: "recent", label: "Terbaru", icon: Clock },
        { value: "hearts", label: "Paling Disukai", icon: Heart },
        { value: "featured", label: "Pilihan Editor", icon: Star },
    ];

    const canCreateStory = user && user.level >= 3;
    const canSubmitMore = myStats?.can_submit_more ?? true;

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="back" />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-pink-100/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute top-20 left-0 w-100 h-100 bg-purple-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <main className="pt-32 pb-20 container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Cerita <span className="text-primary">Inspiratif</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground max-w-2xl mx-auto text-lg"
                    >
                        Kisah nyata dari perjalanan pemulihan. Ceritamu bisa menginspirasi orang lain
                        dan menunjukkan bahwa mereka tidak sendirian.
                    </motion.p>
                </div>

                {/* Featured Stories (if any) */}
                {featuredStories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Cerita Pilihan
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featuredStories.slice(0, 3).map((story) => (
                                <Link key={story.id} href={`/stories/${story.id}`}>
                                    <div className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span className="text-xs font-medium text-yellow-600">Featured</span>
                                        </div>
                                        <h3 className="font-semibold line-clamp-2 mb-2">{story.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {story.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Create Story CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-xl border p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Bagikan Ceritamu</h3>
                                <p className="text-sm text-muted-foreground">
                                    {!token
                                        ? "Masuk untuk berbagi cerita inspiratif"
                                        : !canCreateStory
                                            ? `Level 3 diperlukan untuk berbagi cerita (kamu level ${user?.level})`
                                            : !canSubmitMore
                                                ? `Kamu sudah mencapai batas ${myStats?.max_stories_per_month} cerita bulan ini`
                                                : `${myStats?.stories_this_month ?? 0}/${myStats?.max_stories_per_month ?? 3} cerita bulan ini`
                                    }
                                </p>
                            </div>
                        </div>

                        {!token ? (
                            <Link href="/login">
                                <Button>
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Masuk
                                </Button>
                            </Link>
                        ) : !canCreateStory ? (
                            <Button disabled>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Level 3 Diperlukan
                            </Button>
                        ) : !canSubmitMore ? (
                            <Button disabled>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Batas Tercapai
                            </Button>
                        ) : (
                            <Link href="/stories/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tulis Cerita
                                </Button>
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col md:flex-row gap-4 mb-8"
                >
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                    ? categories.find(c => c.id === selectedCategory)?.name || "Kategori"
                                    : "Semua Kategori"
                                }
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                                Semua Kategori
                            </DropdownMenuItem>
                            {categories.map((category) => (
                                <DropdownMenuItem
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
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
                                {sortOptions.find(o => o.value === sortBy)?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {sortOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => setSortBy(option.value as typeof sortBy)}
                                >
                                    <option.icon className="h-4 w-4 mr-2" />
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.div>

                {/* Stories List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <StoryList stories={stories} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Sebelumnya
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Halaman {page} dari {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

            <Footer />
        </div>
    );
}
