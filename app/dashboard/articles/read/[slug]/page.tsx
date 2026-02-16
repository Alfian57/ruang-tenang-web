"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useArticleDetail } from "./_hooks/useArticleDetail";
import { ArticleContent } from "./_components/ArticleContent";
import { ArticleSidebar } from "./_components/ArticleSidebar";

export default function DashboardArticleDetailPage() {
  const {
    article,
    relatedArticles,
    isLoading,
    isAdmin,
    isModerator,
    isArticleAuthor,
    authorId,
    showBlockConfirm,
    setShowBlockConfirm,
    isBlocking,
    isBlocked,
    handleBlockUser,
    getBackLink,
    router,
  } = useArticleDetail();

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="p-6 lg:p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-64 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-gray-500">Kembali</span>
        </div>
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📄</span>
          <h3 className="font-semibold mb-2">Artikel tidak ditemukan</h3>
          <p className="text-gray-500 text-sm mb-4">
            Artikel yang Anda cari mungkin sudah dihapus atau tidak tersedia
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={getBackLink()}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Detail Artikel</h1>
          <p className="text-gray-500 text-sm">Membaca artikel</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <ArticleContent
          article={article}
          isArticleAuthor={isArticleAuthor}
          isAdmin={isAdmin}
          isModerator={isModerator}
          authorId={authorId}
          isBlocked={isBlocked}
          onBlockClick={() => setShowBlockConfirm(true)}
        />
        <ArticleSidebar
          relatedArticles={relatedArticles}
          backLink={getBackLink()}
        />
      </div>

      {/* Block Confirm Dialog */}
      <Dialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Blokir Pengguna?</DialogTitle>
            <DialogDescription>
              Konten dari <span className="font-semibold text-gray-900">{article?.author?.name}</span> tidak akan ditampilkan lagi kepada Anda. Anda bisa membuka blokir kapan saja melalui menu Pengguna Diblokir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBlockConfirm(false)} disabled={isBlocking}>
              Batal
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleBlockUser}
              disabled={isBlocking}
            >
              {isBlocking ? "Memblokir..." : "Ya, Blokir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
