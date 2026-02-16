"use client";

import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { useNewStory } from "./_hooks/useNewStory";

export default function NewStoryPage() {
  const {
    token,
    router,
    title,
    setTitle,
    content,
    setContent,
    coverImage,
    setCoverImage,
    isAnonymous,
    setIsAnonymous,
    hasTriggerWarning,
    setHasTriggerWarning,
    triggerWarningText,
    setTriggerWarningText,
    selectedCategories,
    tags,
    tagInput,
    setTagInput,
    categories,
    submitting,
    loadingCategories,
    handleAddTag,
    handleRemoveTag,
    handleToggleCategory,
    handleSubmit,
  } = useNewStory();

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/stories")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim Kisah
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Tulis Kisah Inspiratif</h1>
          <p className="text-gray-600">
            Bagikan perjalanan kesehatan mentalmu untuk menginspirasi orang lain.
            Kisahmu akan direview moderator sebelum dipublikasikan.
          </p>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Judul Kisah *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Berikan judul yang menarik..."
              className="mt-1"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
          </div>

          {/* Cover Image */}
          <div>
            <Label>Cover Cerita (Opsional)</Label>
            <div className="mt-2">
              <ImageUpload
                value={coverImage}
                onChange={(url) => setCoverImage(url)}
                token={token}
                aspectRatio="video"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG, GIF, WebP (Maks. 10MB)
            </p>
          </div>

          {/* Categories */}
          <div>
            <Label>Kategori * (Pilih 1-3)</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">Memuat kategori...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm transition-all",
                      selectedCategories.includes(cat.id)
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white hover:bg-amber-50 border-gray-200"
                    )}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Konten Kisah * (Min. 200 karakter)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ceritakan perjalananmu dengan jujur dan tulus. Bagikan apa yang kamu rasakan, pelajaran yang didapat, dan harapanmu..."
              className="mt-1 min-h-[300px]"
            />
            <p
              className={cn(
                "text-xs mt-1",
                content.length < 200 ? "text-amber-600" : "text-gray-500"
              )}
            >
              {content.length}/200 karakter minimum
            </p>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (Opsional, Maks. 5)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ketik tag, tekan Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outline" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Tambah
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAnonymous ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <Label className="cursor-pointer">Posting Anonim</Label>
                  <p className="text-xs text-gray-500">
                    Nama dan profil tidak akan ditampilkan
                  </p>
                </div>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    className={cn(
                      "w-5 h-5",
                      hasTriggerWarning ? "text-amber-500" : "text-gray-500"
                    )}
                  />
                  <div>
                    <Label className="cursor-pointer">Trigger Warning</Label>
                    <p className="text-xs text-gray-500">
                      Kisah mengandung konten sensitif
                    </p>
                  </div>
                </div>
                <Switch
                  checked={hasTriggerWarning}
                  onCheckedChange={setHasTriggerWarning}
                />
              </div>
              {hasTriggerWarning && (
                <div className="mt-3">
                  <Input
                    value={triggerWarningText}
                    onChange={(e) => setTriggerWarningText(e.target.value)}
                    placeholder="Contoh: Menyebutkan tentang self-harm..."
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">
              Panduan Menulis Kisah
            </h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>✓ Ceritakan pengalaman pribadimu dengan jujur</li>
              <li>✓ Fokus pada perjalanan dan pembelajaran</li>
              <li>✓ Berikan harapan kepada pembaca</li>
              <li>✗ Jangan berikan saran medis/profesional</li>
              <li>✗ Hindari detail grafis yang tidak perlu</li>
              <li>✗ Jangan menyebutkan merek obat/terapi tertentu</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/stories")}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim untuk Moderasi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
