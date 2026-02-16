"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Search, Plus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useArticlesPage } from "./_hooks/useArticlesPage";
import { BrowseArticleCard } from "./_components/BrowseArticleCard";
import { MyArticleCard } from "./_components/MyArticleCard";

export default function ArticlesPage() {
  const {
    user,
    activeTab,
    search,
    mySearch,
    selectedCategory,
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
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Artikel</h1>
        <p className="text-gray-500 text-sm mt-1">
          Jelajahi artikel menarik atau kelola tulisanmu sendiri
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="browse">Jelajahi Artikel</TabsTrigger>
            <TabsTrigger value="mine">Artikel Saya</TabsTrigger>
          </TabsList>
          {activeTab === "mine" && (
            <Link href={ROUTES.ARTICLE_CREATE}>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" /> Tulis Artikel
              </Button>
            </Link>
          )}
        </div>

        {/* Browse Published Articles Tab */}
        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                placeholder="Cari artikel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? "gradient-primary" : "bg-white"}
              >
                Semua
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? "gradient-primary" : "bg-white"}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {isBrowseLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden bg-white">
                  <div className="h-40 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : publishedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedArticles.map((article) => (
                <BrowseArticleCard
                  key={article.id}
                  article={article}
                  isOwn={user?.id === article.author?.id || user?.id === article.user_id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="w-8 h-8 text-gray-300" />}
              title="Tidak ada artikel"
              description={search ? "Coba kata kunci lain atau filter berbeda" : "Artikel akan segera tersedia"}
              action={search ? { label: "Hapus Pencarian", onClick: () => setSearch("") } : undefined}
            />
          )}
        </TabsContent>

        {/* My Articles Tab */}
        <TabsContent value="mine" className="space-y-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              placeholder="Cari artikel saya..."
              value={mySearch}
              onChange={(e) => setMySearch(e.target.value)}
              className="pl-10 bg-white"
            />
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
            <EmptyState
              icon={<FileText className="w-8 h-8 text-gray-300" />}
              title="Belum ada artikel"
              description={
                mySearch
                  ? `Tidak ada artikel yang cocok dengan "${mySearch}"`
                  : "Mulai tulis artikel pertamamu hari ini"
              }
              action={
                !mySearch
                  ? { label: "Tulis Artikel", onClick: () => router.push(ROUTES.ARTICLE_CREATE) }
                  : { label: "Hapus Pencarian", onClick: () => setMySearch("") }
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {deleteArticleId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Hapus Artikel?</h3>
            <p className="text-gray-600 mb-4">
              Artikel yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteArticleId(null)}>
                Batal
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(deleteArticleId)}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
