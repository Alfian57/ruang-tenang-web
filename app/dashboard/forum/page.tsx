"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock, User, Heart, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
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
import { useForumPage } from "./_hooks/useForumPage";

export default function ForumPage() {
  const {
    forums,
    categories,
    isLoading,
    search,
    selectedCategory,
    isCreateOpen,
    newTitle,
    newContent,
    newCategoryId,
    isSubmitting,
    setSearch,
    setSelectedCategory,
    setIsCreateOpen,
    setNewTitle,
    setNewContent,
    setNewCategoryId,
    handleCreateForum,
  } = useForumPage();

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Forum Diskusi</h1>
          <p className="text-gray-500">Bergabunglah dalam diskusi dengan komunitas</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 w-full md:w-auto">
              <Plus className="w-4 h-4" />
              Buat Topik Baru
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
                <select
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCategoryId || ""}
                  onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Pilih Kategori (Umum)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Konten (Opsional)</label>
                <Textarea 
                  placeholder="Ceritakan lebih lanjut..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                />
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
            onClick={() => setSelectedCategory(undefined)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === undefined
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            Semua
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
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
           <div className="text-center py-12 bg-white rounded-xl border border-dashed">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <MessageSquare className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">Belum ada topik diskusi</h3>
             <p className="text-gray-500 max-w-sm mx-auto mt-1">
               {search || selectedCategory 
                 ? "Tidak ada hasil yang cocok dengan filter pencarian Anda." 
                 : "Jadilah yang pertama memulai diskusi!"}
             </p>
           </div>
        ) : (
          forums.map((forum) => (
            <Link 
              href={`/dashboard/forum/${forum.id}`} 
              key={forum.id}
              className="block bg-white p-5 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      {forum.category ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                          {forum.category.name}
                        </span>
                      ) : (
                         <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          Umum
                        </span>
                      )}
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                         <User className="w-3 h-3" />
                         {forum.user?.name || "Anonymous"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {forum.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 line-clamp-2 text-sm">{forum.content || "Tidak ada preview konten"}</p>
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                   <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span>{forum.replies_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        <span>{forum.likes_count || 0}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(forum.created_at), { addSuffix: true, locale: id })}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
