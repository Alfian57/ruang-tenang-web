"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  FORUM_SUPPORT_CIRCLES,
  FORUM_POST_FORMAT_LABELS,
  type ForumPostFormat,
  useForumPage,
} from "./_hooks/useForumPage";
import { ForumCard } from "@/components/shared/forum/ForumCard";

const WEEKLY_HEALING_PROMPTS = [
  {
    title: "Hal kecil apa yang paling membantu kamu tetap tenang minggu ini?",
    starter:
      "Aku mau berbagi hal kecil yang cukup membantu aku tetap tenang minggu ini. Semoga bisa jadi ide buat teman-teman juga:",
  },
  {
    title: "Ritual 10 menit saat overthinking malam",
    starter:
      "Kalau pikiranku mulai ramai sebelum tidur, ritual 10 menit ini lumayan membantu. Aku masih belajar konsisten, tapi efeknya kerasa:",
  },
  {
    title: "Satu kalimat penyemangat untuk teman yang lagi capek akademik",
    starter:
      "Buat teman yang lagi capek banget sama tugas dan tekanan kampus, ini satu kalimat yang aku pegang akhir-akhir ini:",
  },
] as const;

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

export default function ForumPage() {
  const {
    forums,
    categories,
    isLoading,
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
  } = useForumPage();

  const handleUseWeeklyPrompt = (prompt: (typeof WEEKLY_HEALING_PROMPTS)[number]) => {
    if (isForumBlocked) return;
    setNewTitle(prompt.title);
    setNewContent(prompt.starter);
    setIsCreateOpen(true);
  };

  const handleSelectPostFormat = (format: ForumPostFormat) => {
    setNewPostFormat(format);
    if (!newContent.trim()) {
      setNewContent(POST_FORMAT_STARTERS[format]);
    }
  };

  const handleToggleSupportCircle = (circleId: (typeof FORUM_SUPPORT_CIRCLES)[number]["id"]) => {
    if (selectedSupportCircle === circleId) {
      setSelectedSupportCircle(undefined);
      return;
    }
    setSelectedSupportCircle(circleId);
  };

  const handleUseSupportCircleDraft = (circle: (typeof FORUM_SUPPORT_CIRCLES)[number]) => {
    if (isForumBlocked) return;

    setSelectedSupportCircle(circle.id);
    setNewPostFormat(circle.defaultFormat);
    setNewTitle(circle.starterTitle);
    setNewContent(circle.starterContent);
    setIsCreateOpen(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Forum Diskusi</h1>
          <p className="text-gray-500">Bergabunglah dalam diskusi dengan komunitas</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 w-full md:w-auto" disabled={isForumBlocked}>
              <Plus className="w-4 h-4" />
              {isForumBlocked ? "Akses Forum Diblokir" : "Buat Topik Baru"}
            </Button>
          </DialogTrigger>
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Akses forum kamu sedang diblokir oleh admin. Kamu tidak bisa membuat topik, membalas, atau berinteraksi di forum.
        </div>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Forum ini dilindungi fitur keamanan komunitas. Kamu bisa melaporkan topik/balasan dan memblokir pengguna dari halaman detail diskusi.
        </p>
      </div>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              Support Circle Tematik
            </p>
            <h2 className="text-lg font-semibold text-indigo-950 mt-1">Pilih circle biar diskusi terasa lebih relevan</h2>
          </div>
          <p className="text-xs text-indigo-700">
            Circle aktif akan memfilter daftar topik dan membantu prefill draft.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {FORUM_SUPPORT_CIRCLES.map((circle) => {
            const isActiveCircle = selectedSupportCircle === circle.id;
            return (
              <div
                key={circle.id}
                className={`rounded-xl border p-3 ${isActiveCircle ? "border-indigo-400 bg-indigo-100/60" : "border-indigo-200 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{circle.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{circle.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSupportCircle(circle.id)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isActiveCircle
                        ? "bg-indigo-700 text-white"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                    aria-pressed={isActiveCircle}
                  >
                    {isActiveCircle ? "Aktif" : "Pilih"}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => handleUseSupportCircleDraft(circle)}
                  disabled={isForumBlocked}
                >
                  Buat Topik di Circle Ini
                </Button>
              </div>
            );
          })}
        </div>

        {selectedSupportCircle && (
          <div className="mt-3 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs text-indigo-800">
            Filter circle aktif. Matikan circle untuk kembali melihat semua topik.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              Healing Prompt Minggu Ini
            </p>
            <h2 className="text-lg font-semibold text-indigo-950 mt-1">Mulai topik dengan nuansa yang lebih suportif</h2>
          </div>
          <p className="text-xs text-indigo-700">
            Pilih prompt untuk otomatis mengisi draft topik baru.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {WEEKLY_HEALING_PROMPTS.map((prompt) => (
            <div key={prompt.title} className="rounded-xl border border-indigo-200 bg-white p-3 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">{prompt.title}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => handleUseWeeklyPrompt(prompt)}
                disabled={isForumBlocked}
              >
                Gunakan Prompt Ini
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input
            placeholder="Cari topik diskusi..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedCategory(undefined)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === undefined
              ? "bg-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Forum List */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border animate-pulse h-32" />
          ))
        ) : forums.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Belum ada topik diskusi</h3>
            <p className="text-gray-400 text-sm mt-1">
              {search || selectedCategory || selectedSupportCircle
                ? "Tidak ada hasil yang cocok dengan filter pencarian Anda."
                : "Jadilah yang pertama memulai diskusi!"}
            </p>
          </div>
        ) : (
          forums.map((forum) => (
            <ForumCard key={forum.id} forum={forum} className="bg-white" />
          ))
        )}
      </div>
    </div>
  );
}
