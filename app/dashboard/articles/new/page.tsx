"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ArticleCategory } from "@/types";

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
        const response = await api.getArticleCategories() as { data: ArticleCategory[] };
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
      await api.createMyArticle(token, {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
        thumbnail: formData.thumbnail || undefined,
      });
      router.push("/dashboard/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat artikel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/articles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Tulis Artikel Baru</h1>
          <p className="text-gray-500 text-sm">Bagikan pengetahuan dan pengalamanmu</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Detail Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Judul Artikel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul artikel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {token && (
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  token={token}
                />
              )}
              <p className="text-xs text-gray-500">
                Unggah gambar untuk thumbnail artikel (opsional)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Konten</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/articles">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" className="gradient-primary" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Publikasikan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
