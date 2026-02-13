"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Eye,
  ArrowLeft,
  Share2,
  Flag,
  AlertTriangle,
  User,
  Send,
  Loader2,
  Calendar,
  Tag,
  MoreVertical,
} from "lucide-react";
import { ReportModal, BlockUserButton } from "@/components/moderation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { InspiringStory, StoryComment } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const storyId = params.id as string;

  const [story, setStory] = useState<InspiringStory | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [heartLoading, setHeartLoading] = useState(false);

  const loadStory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getStory(storyId, token || undefined);
      if (response.data) {
        setStory(response.data);
        // Auto-show content if no trigger warning
        if (!response.data.has_trigger_warning) {
          setShowContent(true);
        }
      }
    } catch (error) {
      console.error("Failed to load story:", error);
      toast.error("Gagal memuat kisah");
    } finally {
      setLoading(false);
    }
  }, [storyId, token]);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await api.getStoryComments(storyId, {}, token || undefined);
      if (response.comments) {
        setComments(response.comments);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [storyId, token]);

  useEffect(() => {
    loadStory();
    loadComments();
  }, [loadStory, loadComments]);

  const handleToggleHeart = async () => {
    if (!token) {
      toast.error("Silakan login untuk memberikan apresiasi");
      return;
    }
    setHeartLoading(true);
    try {
      if (story?.has_hearted) {
        await api.unheartStory(token, storyId);
        setStory((prev) =>
          prev
            ? { ...prev, has_hearted: false, heart_count: prev.heart_count - 1 }
            : null
        );
      } else {
        await api.heartStory(token, storyId);
        setStory((prev) =>
          prev
            ? { ...prev, has_hearted: true, heart_count: prev.heart_count + 1 }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to toggle heart:", error);
      toast.error("Gagal memberikan apresiasi");
    } finally {
      setHeartLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!token) {
      toast.error("Silakan login untuk berkomentar");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }
    setSubmittingComment(true);
    try {
      const response = await api.createStoryComment(token, storyId, {
        content: newComment.trim(),
      });
      if (response.data) {
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
        setStory((prev) =>
          prev ? { ...prev, comment_count: prev.comment_count + 1 } : null
        );
        toast.success("Komentar berhasil ditambahkan");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Gagal menambahkan komentar");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Kisah tidak ditemukan</h2>
        <Button onClick={() => router.push("/dashboard/stories")}>
          Kembali ke Kisah
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              {token && story?.author?.id !== user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ReportModal
                      type="story"
                      contentId={storyId}
                      userId={story?.author?.id}
                      trigger={
                        <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer">
                          <Flag className="w-4 h-4 mr-2" />
                          Laporkan Kisah
                        </div>
                      }
                    />
                    <BlockUserButton
                      userId={story?.author?.id || 0}
                      userName={story?.author?.name || "User"}
                      className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Trigger Warning Overlay */}
        {story.has_trigger_warning && !showContent && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Peringatan Konten Sensitif</h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {story.trigger_warning_text ||
                "Kisah ini mungkin mengandung konten yang sensitif atau memicu."}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/stories")}
              >
                Kembali
              </Button>
              <Button
                onClick={() => setShowContent(true)}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Saya Mengerti, Tampilkan
              </Button>
            </div>
          </div>
        )}

        {/* Story Content */}
        {(!story.has_trigger_warning || showContent) && (
          <>
            {/* Cover Image */}
            {story.cover_image && (
              <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-gray-100 relative">
                <Image
                  src={story.cover_image}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Title & Meta */}
            <div className="mb-8">
              {story.is_featured && (
                <Badge className="bg-amber-500 text-white mb-3">
                  ✨ Kisah Pilihan
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {story.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  {story.is_anonymous ? (
                    <>
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span>Anonim</span>
                    </>
                  ) : (
                    <>
                      {story.author?.avatar ? (
                        <Image
                          src={story.author.avatar}
                          alt={story.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-amber-600" />
                        </div>
                      )}
                      <span className="font-medium">{story.author?.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  {story.published_at &&
                    format(new Date(story.published_at), "d MMMM yyyy", {
                      locale: idLocale,
                    })}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4" />
                  {story.view_count} views
                </div>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {story.categories?.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="gap-1">
                  {cat.icon} {cat.name}
                </Badge>
              ))}
              {story.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            {/* Actions */}
            <div className="flex items-center gap-4 py-6 border-y mb-8">
              <Button
                variant={story.has_hearted ? "default" : "outline"}
                onClick={handleToggleHeart}
                disabled={heartLoading}
                className={cn(
                  "gap-2",
                  story.has_hearted && "bg-rose-500 hover:bg-rose-600"
                )}
              >
                <Heart
                  className={cn(
                    "w-5 h-5",
                    story.has_hearted && "fill-current"
                  )}
                />
                {story.heart_count} Apresiasi
              </Button>
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                {story.comment_count} Komentar
              </div>
            </div>

            {/* Comments Section */}
            <section>
              <h2 className="text-xl font-bold mb-6">
                Komentar ({story.comment_count})
              </h2>

              {/* Comment Input */}
              {token ? (
                <div className="mb-6">
                  <Textarea
                    placeholder="Tulis komentar yang mendukung..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !newComment.trim()}
                    className="gap-2"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Kirim Komentar
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-gray-600 mb-2">
                    Silakan login untuk berkomentar
                  </p>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada komentar. Jadilah yang pertama!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        {comment.author?.avatar ? (
                          <Image
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {comment.author?.name || "Pengguna"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(
                                  new Date(comment.created_at),
                                  "d MMM yyyy, HH:mm",
                                  { locale: idLocale }
                                )}
                              </span>
                            </div>
                            {token && comment.author?.id !== user?.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="w-3 h-3 text-gray-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <ReportModal
                                    type="story_comment"
                                    contentId={comment.id}
                                    userId={comment.author?.id}
                                    trigger={
                                      <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer">
                                        <Flag className="w-4 h-4 mr-2" />
                                        Laporkan
                                      </div>
                                    }
                                  />
                                  <BlockUserButton
                                    userId={comment.author?.id || 0}
                                    userName={comment.author?.name || "User"}
                                    className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                                  />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-gray-500 hover:text-rose-500"
                            >
                              <Heart className="w-3 h-3" />
                              {comment.heart_count}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
