"use client";

import { motion } from "framer-motion";
import { PublicPageHero } from "../_components/PublicPageHero";
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
    <div className="public-page">
      <Navbar variant="back" />

      <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <PublicPageHero eyebrow="Dari hati ke hati" title={<>Cerita <span>Inspiratif</span></>} description="Kisah nyata dari perjalanan pemulihan. Ceritamu bisa menginspirasi orang lain dan menunjukkan bahwa mereka tidak sendirian." pose="listen" />

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
                <div className="mt-8 flex flex-wrap justify-center gap-2">
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

      <Footer variant="landing" />
    </div>
  );
}
