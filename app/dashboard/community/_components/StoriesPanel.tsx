"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Search,
  Filter,
  BadgeCheck,
  AlertTriangle,
  User,
  X,
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
import { useStoriesPage } from "@/app/dashboard/stories/_hooks/useStoriesPage";
import { ROUTES } from "@/lib/routes";
import { StoryCategoryIcon } from "@/components/shared/stories/StoryCategoryIcon";
import { Pagination } from "@/components/ui/pagination";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

function getStatusLabel(status?: string): string {
  switch (status) {
    case "pending":
      return "Menunggu Moderasi";
    case "rejected":
      return "Ditolak";
    case "revision_requested":
      return "Perlu Revisi";
    case "approved":
      return "Disetujui";
    default:
      return "Status Tidak Diketahui";
  }
}

function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "rejected":
      return "bg-primary/10 text-primary border-primary/20";
    case "revision_requested":
      return "bg-primary/10 text-primary border-primary/20";
    case "approved":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function StoriesPanel() {
  const {
    router,
    stories,
    categories,
    loading,
    page,
    setPage,
    totalPages,
    hasError,
    retry,
    storyView,
    setStoryView,
    searchQuery,
    selectedCategory,
    sortBy,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
  } = useStoriesPage();

  return (
    <div className="min-w-0 pb-8">
      <div className="pt-1">
        <div className="theme-accent-border-soft mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white/90 p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={storyView === "public" ? "default" : "outline"} onClick={() => setStoryView("public")}>Jelajahi kisah</Button>
            <Button size="sm" variant={storyView === "mine" ? "default" : "outline"} onClick={() => setStoryView("mine")}>Kisah saya</Button>
          </div>
          <Button asChild size="sm" variant="outline"><Link href={ROUTES.COMMUNITY_STORY_CREATE}>Tulis Kisah</Link></Button>
        </div>
        {/* Filters */}
        {storyView === "public" && <section className="theme-accent-border-soft mb-6 rounded-2xl border bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">Temukan kisah yang ingin kamu baca</p>
            {searchQuery && <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-theme-accent-dark" onClick={() => setSearchQuery("")}><X className="h-3.5 w-3.5" /> Bersihkan pencarian</Button>}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                aria-label="Cari kisah"
                placeholder="Cari kisah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl bg-white pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full rounded-xl bg-white md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    <StoryCategoryIcon slug={cat.slug} name={cat.name} className="h-4 w-4" />
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "hearts" | "featured")}>
              <SelectTrigger className="w-full rounded-xl bg-white md:w-48">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Terbaru</SelectItem>
                <SelectItem value="hearts">Paling Disukai</SelectItem>
                <SelectItem value="featured">Kisah Pilihan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>}

        {/* Stories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-theme-accent-border bg-white shadow-sm"
              >
                <div className="aspect-[16/9] animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-50" />
                </div>
              </div>
            ))}
          </div>
        ) : hasError ? (
          <DashboardMascotEmpty image="/images/landing/mascot/community.webp" title="Kisah belum bisa dimuat" description="Coba sambungkan kembali ke komunitas." action={<Button onClick={() => void retry()}>Coba lagi</Button>} />
        ) : stories.length === 0 ? (
          <DashboardMascotEmpty image="/images/landing/mascot/community.webp" title={storyView === "mine" ? "Kamu belum menulis kisah" : "Belum ada kisah yang cocok"} description={storyView === "mine" ? "Kisahmu, termasuk yang menunggu moderasi, akan terlihat di sini." : "Coba filter lain atau jadilah yang pertama berbagi."} action={<Button onClick={() => router.push(ROUTES.COMMUNITY_STORY_CREATE)}>Tulis Kisah</Button>} />
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={ROUTES.communityStory(story.id)}
                  className="theme-accent-border-soft group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_8px_28px_-20px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_42px_-26px_rgba(190,24,93,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-violet-50">
                    {!story.cover_image && (
                      <>
                        <div aria-hidden="true" className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-white/70 blur-2xl" />
                        <div aria-hidden="true" className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-white/70 to-transparent" />
                      </>
                    )}
                    <Image
                      src={story.cover_image || "/images/dashboard/mascot/article-placeholder.webp"}
                      alt={story.cover_image ? story.title : ""}
                      fill
                      aria-hidden={!story.cover_image}
                      className={story.cover_image
                        ? "object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        : "object-contain object-right-bottom p-1 transition-transform duration-500 group-hover:scale-[1.04]"}
                      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                    />
                    {story.cover_image && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/5" />}
                    <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
                      {story.is_featured && (
                        <Badge className="gap-1 border border-white/70 bg-white/90 text-amber-700 shadow-sm backdrop-blur-sm">
                          <BadgeCheck className="h-3 w-3" /> Pilihan
                        </Badge>
                      )}
                      {story.is_own && (
                        <Badge className={`${getStatusBadgeClass(story.status)} shadow-sm`}>{getStatusLabel(story.status)}</Badge>
                      )}
                      {story.has_trigger_warning && (
                        <Badge className="gap-1 border border-white/70 bg-amber-50/95 text-amber-800 shadow-sm backdrop-blur-sm">
                          <AlertTriangle className="h-3 w-3" /> Peringatan konten
                        </Badge>
                      )}
                    </div>
                    {story.is_own && <span className="absolute bottom-3 right-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm">Kisah saya</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-2 flex min-h-6 flex-wrap items-center gap-1.5">
                      {story.categories?.slice(0, 2).map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="max-w-full gap-1 rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          <StoryCategoryIcon slug={cat.slug} name={cat.name} className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </Badge>
                      ))}
                      {story.categories && story.categories.length > 2 && <span className="text-xs text-slate-400">+{story.categories.length - 2}</span>}
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                      {story.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
                      {story.excerpt || "Buka kisah ini untuk membaca pengalaman yang dibagikan."}
                    </p>
                    {story.is_own && story.status !== "approved" && (
                      <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" /> Kisah ini hanya terlihat olehmu.
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-rose-700 ring-1 ring-rose-100">
                          {story.is_anonymous ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-bold">{story.author?.name?.trim().charAt(0).toLocaleUpperCase() || <User className="h-4 w-4" />}</span>
                          )}
                        </span>
                        <span className="truncate text-sm font-medium text-slate-700">{story.is_anonymous ? "Anonim" : story.author?.name || "Anggota Ruang Tenang"}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1.5 transition-colors group-hover:bg-rose-100/80">
                          <Heart className="h-3.5 w-3.5 text-rose-500" />
                          {story.heart_count}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1.5 transition-colors group-hover:bg-slate-100">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {story.comment_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
