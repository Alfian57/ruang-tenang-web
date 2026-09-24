"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { BookOpen, FilePenLine, Search, Plus, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabList } from "@/components/shared/dashboard/DashboardHubTabs";
import { useArticlesPage } from "./_hooks/useArticlesPage";
import { BrowseArticleCard } from "./_components/BrowseArticleCard";
import { MyArticleCard } from "./_components/MyArticleCard";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ARTICLE_TABS = [
  { value: "browse", label: "Jelajahi Artikel", icon: BookOpen },
  { value: "mine", label: "Artikel Saya", icon: FilePenLine },
] as const;

export default function ArticlesPage() {
  const {
    user,
    activeTab,
    search,
    mySearch,
    selectedCategory,
    page,
    setPage,
    browseTotalPages,
    myTotalPages,
    browseError,
    myError,
    retryBrowse,
    retryMine,
    categories,
    publishedArticles,
    isBrowseLoading,
    myArticles,
    isMyLoading,
    deleteArticleId,
    setActiveTab,
    setSearch,
    setMySearch,
    setSelectedCategory,
    setDeleteArticleId,
    handleDelete,
  } = useArticlesPage();
  const router = useRouter();

  return (
    <div className="pb-8">
      <DashboardMascotHero eyebrow="Bacaan untuk setiap suasana" title="Artikel" description="Temukan perspektif baru untuk memahami diri, atau tulis pengalamanmu sendiri untuk menemani orang lain." image="/images/landing/mascot/read.webp" imageAlt="Bulan Pulih sedang membaca" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
        <div className="flex flex-wrap items-center justify-start gap-3">
          <DashboardHubTabList tabs={ARTICLE_TABS} className="mb-0" />
          {activeTab === "mine" && (
            <Link href={ROUTES.ARTICLE_CREATE} className="shrink-0">
              <Button className="gradient-primary rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
              </Button>
            </Link>
          )}
        </div>

        {/* Browse Published Articles Tab */}
        <TabsContent value="browse" className="min-w-0 space-y-5">
          <div data-user-tour="articles-discover" className="theme-accent-border-soft rounded-2xl border bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal className="h-4 w-4 text-theme-accent-dark" aria-hidden="true" />
              Temukan bacaan yang pas
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                aria-label="Cari artikel"
                placeholder="Cari artikel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl bg-white pl-10 pr-10"
              />
              {search && <button type="button" aria-label="Bersihkan pencarian artikel" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
            </div>
            <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Filter kategori artikel">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-full ${selectedCategory === null ? "gradient-primary" : "bg-white"}`}
              >
                Semua
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full ${selectedCategory === cat.id ? "gradient-primary" : "bg-white"}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {isBrowseLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden bg-white">
                  <div className="aspect-16/10 w-full bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : browseError ? (
            <DashboardMascotEmpty image="/images/landing/mascot/read.webp" title="Artikel belum bisa dimuat" description="Coba lagi saat koneksimu sudah stabil." action={<Button onClick={() => void retryBrowse()}>Coba lagi</Button>} />
          ) : publishedArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publishedArticles.map((article) => (
                <BrowseArticleCard
                  key={article.id}
                  article={article}
                  isOwn={user?.id === article.author?.id || user?.id === article.user_id}
                />
              ))}
            </div>
          ) : (
            <DashboardMascotEmpty image="/images/landing/mascot/read.webp" title="Belum ada artikel yang cocok" description={search || selectedCategory ? "Coba kata kunci atau kategori lain." : "Artikel baru akan hadir di sini."} action={search || selectedCategory ? <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(null); }}>Bersihkan filter</Button> : undefined} />
          )}
          {!isBrowseLoading && !browseError && <Pagination currentPage={page} totalPages={browseTotalPages} onPageChange={setPage} />}
        </TabsContent>

        {/* My Articles Tab */}
        <TabsContent value="mine" className="min-w-0 space-y-5">
          <div className="theme-accent-border-soft rounded-2xl border bg-white/90 p-4 shadow-sm sm:p-5">
            <p className="mb-3 text-sm font-semibold text-slate-700">Kelola tulisanmu</p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                aria-label="Cari artikel saya"
                placeholder="Cari artikel saya..."
                value={mySearch}
                onChange={(e) => setMySearch(e.target.value)}
                className="h-11 rounded-xl bg-white pl-10 pr-10"
              />
              {mySearch && <button type="button" aria-label="Bersihkan pencarian artikel saya" onClick={() => setMySearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
            </div>
          </div>

          {isMyLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-20 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myError ? (
            <DashboardMascotEmpty image="/images/landing/mascot/read.webp" title="Tulisanmu belum bisa dimuat" description="Coba lagi sebentar lagi." action={<Button onClick={() => void retryMine()}>Coba lagi</Button>} />
          ) : myArticles.length > 0 ? (
            <div className="grid gap-4">
              {myArticles.map((article) => (
                <MyArticleCard
                  key={article.id}
                  article={article}
                  onDelete={setDeleteArticleId}
                />
              ))}
            </div>
          ) : (
            <DashboardMascotEmpty image="/images/landing/mascot/read.webp" title="Belum ada tulisan di sini" description={mySearch ? `Tidak ada artikel yang cocok dengan “${mySearch}”.` : "Tulis satu hal kecil yang ingin kamu bagikan."} action={<Button onClick={() => mySearch ? setMySearch("") : router.push(ROUTES.ARTICLE_CREATE)}>{mySearch ? "Bersihkan pencarian" : "Tulis Artikel"}</Button>} />
          )}
          {!isMyLoading && !myError && <Pagination currentPage={page} totalPages={myTotalPages} onPageChange={setPage} />}
        </TabsContent>
      </Tabs>

      <ConfirmDialog isOpen={Boolean(deleteArticleId)} onClose={() => setDeleteArticleId(null)} onConfirm={() => deleteArticleId ? handleDelete(deleteArticleId) : undefined} title="Hapus Artikel?" description="Artikel yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?" confirmText="Hapus" variant="danger" />
    </div>
  );
}
