"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { ArticleCategory } from "@/types";
import { ROUTES } from "@/lib/routes";
import { ArticleEditorShell } from "../_components/ArticleEditorShell";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: 0,
    thumbnail: "",
  });

  const loadData = useCallback(async () => {
    if (!token || !params.slug) return;
    setIsLoading(true);
    try {
      const [articleRes, categoriesRes] = await Promise.all([
        articleService.getArticleForUser(token, params.slug as string),
        articleService.getCategories(),
      ]);

      const article = articleRes.data;
      setCategories(categoriesRes.data || []);
      setFormData({
        title: article.title,
        content: article.content,
        category_id: article.category_id,
        thumbnail: article.thumbnail || "",
      });

      if (article.status === "blocked") {
        setError("Artikel ini diblokir oleh admin dan tidak dapat diedit");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat artikel");
    } finally {
      setIsLoading(false);
    }
  }, [token, params.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !params.slug) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Judul dan konten wajib diisi");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await articleService.updateArticle(token, params.slug as string, {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
        thumbnail: formData.thumbnail || undefined,
      });
      router.push(`${ROUTES.ARTICLES}?tab=mine`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan artikel");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ArticleEditorShell backHref={`${ROUTES.ARTICLES}?tab=mine`} title="Edit artikel" description="Memuat tulisanmu untuk diperbarui.">
        <div className="animate-pulse space-y-7" aria-label="Memuat editor artikel">
          <div className="space-y-2"><div className="h-4 w-28 rounded bg-slate-200" /><div className="h-11 w-full rounded-xl bg-slate-100" /></div>
          <div className="space-y-2"><div className="h-4 w-20 rounded bg-slate-200" /><div className="h-11 w-full rounded-xl bg-slate-100" /></div>
          <div className="space-y-3 rounded-2xl border border-slate-100 p-5"><div className="h-4 w-32 rounded bg-slate-200" /><div className="h-36 w-full rounded-xl bg-slate-100" /></div>
          <div className="space-y-2"><div className="h-4 w-24 rounded bg-slate-200" /><div className="h-64 w-full rounded-2xl bg-slate-100" /></div>
        </div>
      </ArticleEditorShell>
    );
  }

  return (
    <ArticleEditorShell backHref="/dashboard/articles?tab=mine" title="Edit artikel" description="Perbarui tulisanmu dengan tenang. Perubahan akan disimpan ke artikel yang sudah kamu buat.">
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
                placeholder="Masukkan judul artikel"
                required
              />
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
              <Button type="submit" className="gradient-primary h-11 rounded-xl px-6" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
      </form>
    </ArticleEditorShell>
  );
}
