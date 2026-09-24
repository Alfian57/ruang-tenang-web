"use client";

import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORUM_POST_FORMAT_LABELS, FORUM_SUPPORT_CIRCLES, type ForumPageState, type ForumPostFormat } from "@/app/dashboard/forum/_hooks/useForumPage";
import { ForumCard } from "@/components/shared/forum/ForumCard";
import { Pagination } from "@/components/ui/pagination";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

const POST_FORMAT_DESCRIPTIONS: Record<ForumPostFormat, string> = {
  curhat: "Ruang aman untuk menulis isi hati dengan jujur dan tenang.",
  minta_saran: "Minta masukan konkret dari komunitas untuk situasi yang sedang dihadapi.",
  cari_teman: "Cari teman seperjalanan yang mengalami kondisi serupa agar tidak merasa sendirian.",
  victory_note: "Rayakan kemajuan kecil agar semangatmu dan teman-teman tetap terjaga.",
  confession: "Tulisan pengakuan untuk melepaskan beban yang sulit diucapkan langsung.",
};

const POST_FORMAT_STARTERS: Record<ForumPostFormat, string> = {
  curhat:
    "Aku lagi butuh ruang untuk cerita. Belakangan ini rasanya campur aduk dan aku ingin menuliskannya pelan-pelan.",
  minta_saran:
    "Aku butuh saran dari teman-teman yang mungkin pernah ada di situasi serupa. Menurut kalian langkah pertama yang paling realistis apa?",
  cari_teman:
    "Lagi cari teman seperjuangan yang sedang menghadapi hal mirip. Siapa pun yang relate, aku senang kalau kita bisa saling dukung.",
  victory_note:
    "Mau berbagi kemenangan kecil hari ini: aku berhasil menyelesaikan satu hal yang kemarin terasa berat. Semoga ini jadi semangat bareng.",
  confession:
    "Aku mau jujur tentang hal yang selama ini kupendam. Menulis ini jadi caraku untuk mulai berdamai.",
};

export default function ForumPanel({ forumPage }: { forumPage: ForumPageState }) {
  const {
    forums,
    categories,
    isLoading,
    hasError,
    totalPages,
    page,
    setPage,
    retry,
    search,
    selectedCategory,
    selectedSupportCircle,
    isCreateOpen,
    newTitle,
    newContent,
    newCategoryId,
    newPostFormat,
    isSubmitting,
    isForumBlocked,
    setSearch,
    setSelectedCategory,
    setSelectedSupportCircle,
    setIsCreateOpen,
    setNewTitle,
    setNewContent,
    setNewCategoryId,
    setNewPostFormat,
    handleCreateForum,
  } = forumPage;

  const handleSelectPostFormat = (format: ForumPostFormat) => {
    setNewPostFormat(format);
    if (!newContent.trim()) {
      setNewContent(POST_FORMAT_STARTERS[format]);
    }
  };

  return (
    <div className="min-w-0 space-y-6 pb-8 pt-1">
      <div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Forum diskusi</h2>
          <p className="text-sm text-slate-500">Bergabunglah dalam diskusi yang hangat dan saling mendukung.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Topik Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Judul</label>
                <Input
                  placeholder="Misal: Cara mengatasi kecemasan..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={newCategoryId ? String(newCategoryId) : "all"}
                  onValueChange={(value) => setNewCategoryId(value === "all" ? undefined : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori (Umum)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Pilih Kategori (Umum)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format Post</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(FORUM_POST_FORMAT_LABELS) as ForumPostFormat[]).map((format) => {
                    const active = newPostFormat === format;
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => handleSelectPostFormat(format)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                      >
                        {FORUM_POST_FORMAT_LABELS[format]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">{POST_FORMAT_DESCRIPTIONS[newPostFormat]}</p>
                {newPostFormat === "confession" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Mode ini membantu menulis pengakuan dengan lebih lega, tetapi identitas akun tetap terlihat oleh sistem untuk kebutuhan moderasi dan keamanan komunitas.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Konten (Opsional)</label>
                <Textarea
                  placeholder="Ceritakan lebih lanjut..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-500">
                  Gunakan bahasa yang suportif, validasi perasaan, dan hindari penghakiman.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button onClick={handleCreateForum} disabled={isSubmitting || !newTitle}>
                {isSubmitting ? "Membuat..." : "Buat Topik"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isForumBlocked && (
        <div className="rounded-xl border border-theme-accent-border bg-theme-accent-soft px-4 py-3 text-sm text-theme-accent-dark">
          Akses forum kamu sedang diblokir oleh admin. Kamu tidak bisa membuat topik, membalas, atau berinteraksi di forum.
        </div>
      )}

      {selectedSupportCircle && <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-theme-accent-border bg-theme-accent-soft px-4 py-3 text-sm"><span>Lingkar dukungan: <strong>{FORUM_SUPPORT_CIRCLES.find((circle) => circle.id === selectedSupportCircle)?.title}</strong></span><Button size="sm" variant="outline" onClick={() => setSelectedSupportCircle(undefined)}>Lihat semua</Button></div>}

      {/* Filters */}
      <div className="theme-accent-border-soft min-w-0 space-y-3 rounded-2xl border bg-white/90 p-4 shadow-sm sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><SlidersHorizontal className="h-4 w-4 text-theme-accent-dark" aria-hidden="true" /> Temukan topik</p>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input
            aria-label="Cari topik diskusi"
            placeholder="Cari topik diskusi..."
            className="h-11 rounded-xl bg-white pl-10 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button type="button" aria-label="Bersihkan pencarian forum" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
        </div>

        <div className="relative min-w-0" role="group" aria-label="Filter kategori forum">
          <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedCategory(undefined)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === undefined
              ? "bg-primary text-white"
              : "bg-white text-gray-600 hover:bg-theme-accent-soft border border-slate-200"
              }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === cat.id
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-theme-accent-soft border border-slate-200"
                }`}
            >
              {cat.name}
            </button>
          ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white/95 to-transparent" aria-hidden="true" />
        </div>
      </div>

      {/* Forum List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border animate-pulse h-32" />
          ))
        ) : hasError ? (
          <DashboardMascotEmpty image="/images/landing/mascot/community.webp" title="Forum belum bisa dimuat" description="Koneksi mungkin terputus. Coba lagi sebentar lagi." action={<Button onClick={() => void retry()}>Coba lagi</Button>} />
        ) : forums.length === 0 ? (
          <div className="md:col-span-2"><DashboardMascotEmpty image="/images/landing/mascot/community.webp" title="Belum ada topik diskusi" description={search || selectedCategory || selectedSupportCircle ? "Coba pencarian atau kategori lain." : "Jadilah yang pertama membuka obrolan hangat di sini."} action={search || selectedCategory || selectedSupportCircle ? <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(undefined); setSelectedSupportCircle(undefined); }}>Bersihkan filter</Button> : undefined} /></div>
        ) : (
          forums.map((forum) => (
            <ForumCard key={forum.id} forum={forum} className="theme-accent-border-soft min-w-0 bg-white shadow-sm" />
          ))
        )}
      </div>
      {!isLoading && !hasError && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
