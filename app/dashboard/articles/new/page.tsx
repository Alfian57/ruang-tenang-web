"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { ArticleCategory } from "@/types";
import { ArticleEditorShell } from "../_components/ArticleEditorShell";

export default function NewArticlePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: 0,
    thumbnail: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await articleService.getCategories() as { data: ArticleCategory[] };
        setCategories(response.data || []);
        if (response.data && response.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: response.data[0].id }));
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Judul dan konten wajib diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await articleService.createArticle(token, {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
        thumbnail: formData.thumbnail || undefined,
      });
      // Refresh user to update EXP
      await useAuthStore.getState().refreshUser();
      router.push(`${ROUTES.ARTICLES}?tab=mine`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat artikel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ArticleEditorShell backHref={`${ROUTES.ARTICLES}?tab=mine`} title="Tulis artikel baru" description="Bagikan pengetahuan dan pengalamanmu. Cerita yang kamu tulis bisa menjadi teman bagi orang lain.">
      <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-slate-800">Judul artikel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-11 rounded-xl border-slate-200 px-4"
                placeholder="Contoh: Hal kecil yang membantuku melewati hari berat"
                required
              />
              <p className="text-xs text-slate-500">Pilih judul yang jelas dan terasa dekat dengan pengalamanmu.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold text-slate-800">Kategori</Label>
              <select
                id="category"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="theme-accent-border-soft space-y-3 rounded-2xl border bg-slate-50/70 p-4 sm:p-5">
              <div><Label className="font-semibold text-slate-800">Sampul artikel</Label>
              <p className="mt-1 text-xs text-slate-500">Gambar sampul membantu pembaca mengenali tulisanmu. Bagian ini opsional.</p></div>
              {token && (
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  token={token}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-slate-800">Isi artikel</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" className="h-11 rounded-xl">
                <Link href={`${ROUTES.ARTICLES}?tab=mine`}>Batal</Link>
              </Button>
              <Button type="submit" className="gradient-primary h-11 rounded-xl px-6" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Publikasikan"}
              </Button>
            </div>
      </form>
    </ArticleEditorShell>
  );
}
