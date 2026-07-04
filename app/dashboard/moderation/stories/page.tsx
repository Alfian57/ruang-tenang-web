"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileEdit, Sparkles, Eye, ArrowLeft, BookOpen } from "lucide-react";
import { formatDate, getHtmlExcerpt } from "@/utils";
import { useModerationStories, type StoryModerationAction } from "./_hooks/useModerationStories";

export default function ModerationStoriesPage() {
  const {
    stories,
    isLoading,
    page,
    totalPages,
    processingId,
    setPage,
    loadStories,
    moderate,
    setFeatured,
  } = useModerationStories();

  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const handleModerate = async (id: string, status: StoryModerationAction) => {
    const feedback = feedbackMap[id]?.trim() || undefined;
    if ((status === "rejected" || status === "revision_requested") && !feedback) {
      // Encourage feedback for negative actions but don't hard-block.
    }
    try {
      await moderate(id, status, feedback);
      setFeedbackMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      // error already logged in hook
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={ROUTES.ADMIN.MODERATION} aria-label="Kembali ke dashboard moderasi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Moderasi Kisah Inspiratif</h1>
            <p className="text-muted-foreground">Tinjau kisah yang menunggu persetujuan</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadStories} disabled={isLoading} className="w-full sm:w-auto">
          Muat Ulang
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kisah Pending ({stories.length})</CardTitle>
          <CardDescription>
            Setujui, minta revisi, atau tolak kisah. Berikan catatan untuk membantu penulis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-3 p-4 border rounded-lg">
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Tidak ada kisah pending</h3>
              <p className="text-gray-400 text-sm mt-1">Semua kisah telah dimoderasi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => {
                const isProcessing = processingId === story.id;
                return (
                  <div key={story.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{story.title}</h3>
                          {story.has_trigger_warning && (
                            <Badge variant="destructive">Trigger Warning</Badge>
                          )}
                          {story.is_anonymous && <Badge variant="secondary">Anonim</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {story.is_anonymous
                            ? "Penulis anonim"
                            : story.author?.name || "Tidak diketahui"}
                          {" • "}
                          {formatDate(story.created_at)}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link href={ROUTES.publicStoryDetail(story.id)} target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat
                        </Link>
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {getHtmlExcerpt(story.content, 280)}
                    </p>

                    {story.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.categories.map((cat) => (
                          <Badge key={cat.id} variant="outline">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Textarea
                      placeholder="Catatan untuk penulis (opsional, dianjurkan untuk penolakan/revisi)"
                      value={feedbackMap[story.id] || ""}
                      onChange={(e) =>
                        setFeedbackMap((prev) => ({ ...prev, [story.id]: e.target.value }))
                      }
                      rows={2}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleModerate(story.id, "approved")}
                        disabled={isProcessing}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(story.id, "revision_requested")}
                        disabled={isProcessing}
                      >
                        <FileEdit className="h-4 w-4 mr-1" />
                        Minta Revisi
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleModerate(story.id, "rejected")}
                        disabled={isProcessing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFeatured(story.id, !story.is_featured)}
                        disabled={isProcessing}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {story.is_featured ? "Hapus Unggulan" : "Jadikan Unggulan"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || isLoading}
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || isLoading}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
