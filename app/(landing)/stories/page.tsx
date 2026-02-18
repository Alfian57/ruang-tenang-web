"use client";

import { motion } from "framer-motion";
import { Navbar, Footer } from "@/components/layout";
import { StoryList } from "@/components/shared/stories";
import { Button } from "@/components/ui/button";
import { useStoriesData } from "./_hooks/useStoriesData";
import {
  FeaturedStories,
  CreateStoryCTA,
  StoriesFilters,
  StoriesSkeleton,
} from "./_components";

export default function StoriesPage() {
  const {
    stories,
    featuredStories,
    categories,
    myStats,
    loading,
    searchQuery,
    selectedCategory,
    sortBy,
    page,
    totalPages,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setPage,
    handleSearch,
  } = useStoriesData();

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

        {loading && stories.length === 0 ? (
          <StoriesSkeleton />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FeaturedStories stories={featuredStories} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CreateStoryCTA myStats={myStats} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StoriesFilters
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                sortBy={sortBy}
                categories={categories}
                onSearchChange={setSearchQuery}
                onCategoryChange={setSelectedCategory}
                onSortChange={setSortBy}
                onSearchSubmit={handleSearch}
              />
            </motion.div>

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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
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
            </motion.div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
