"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar, Footer } from "@/components/landing";
import { useAuthStore } from "@/stores/authStore";
import { StoryDetail, StoryCommentsList, StoryCommentInput } from "@/components/stories";
import { InspiringStory, StoryComment } from "@/types";
import { Loader2, LogIn, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StoryDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { token, user } = useAuthStore();

    const [story, setStory] = useState<InspiringStory | null>(null);
    const [comments, setComments] = useState<StoryComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [heartLoading, setHeartLoading] = useState(false);
    const [commentPage, setCommentPage] = useState(1);
    const [totalCommentPages, setTotalCommentPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const fetchStory = useCallback(async () => {
        try {
            const response = await api.getStory(id, token || undefined);
            setStory(response.data);
        } catch (err) {
            console.error("Failed to fetch story:", err);
            setError("Cerita tidak ditemukan");
        }
    }, [id, token]);

    const fetchComments = useCallback(async (page: number = 1) => {
        try {
            const response = await api.getStoryComments(id, { page, limit: 20 }, token || undefined);
            setComments(response.comments || []);
            setTotalCommentPages(response.total_pages || 1);
            setCommentPage(page);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        }
    }, [id, token]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchStory();
            await fetchComments();
            setLoading(false);
        };
        loadData();
    }, [fetchStory, fetchComments]);

    const handleHeart = async () => {
        if (!token || !story) return;

        setHeartLoading(true);
        try {
            if (story.has_hearted) {
                await api.unheartStory(token, id);
                setStory({
                    ...story,
                    has_hearted: false,
                    heart_count: story.heart_count - 1,
                });
            } else {
                await api.heartStory(token, id);
                setStory({
                    ...story,
                    has_hearted: true,
                    heart_count: story.heart_count + 1,
                });
            }
        } catch (err) {
            console.error("Failed to toggle heart:", err);
        } finally {
            setHeartLoading(false);
        }
    };

    const handleCommentHeart = async (commentId: string) => {
        if (!token) return;

        try {
            const comment = comments.find(c => c.id === commentId);
            if (!comment) return;

            if (comment.has_hearted) {
                await api.unheartStoryComment(token, id, commentId);
            } else {
                await api.heartStoryComment(token, id, commentId);
            }

            setComments(comments.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        has_hearted: !c.has_hearted,
                        heart_count: c.has_hearted ? c.heart_count - 1 : c.heart_count + 1,
                    };
                }
                return c;
            }));
        } catch (err) {
            console.error("Failed to toggle comment heart:", err);
        }
    };

    const handleSubmitComment = async (content: string) => {
        if (!token) return;

        setCommentLoading(true);
        try {
            const response = await api.createStoryComment(token, id, { content });
            setComments([response.data, ...comments]);
            if (story) {
                setStory({
                    ...story,
                    comment_count: story.comment_count + 1,
                });
            }
        } catch (err) {
            console.error("Failed to submit comment:", err);
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar variant="back" />
                <div className="flex justify-center items-center py-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar variant="back" />
                <div className="container mx-auto px-4 py-40 text-center">
                    <h1 className="text-2xl font-bold mb-4">Cerita Tidak Ditemukan</h1>
                    <p className="text-muted-foreground mb-6">{error || "Cerita yang kamu cari tidak ada."}</p>
                    <Link href="/stories">
                        <Button>Kembali ke Daftar Cerita</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="back" />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-pink-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <main className="pt-32 pb-20 container mx-auto px-4">
                {/* Story Content */}
                <StoryDetail
                    story={story}
                    onHeart={token ? handleHeart : undefined}
                    isHeartLoading={heartLoading}
                />

                {/* Comments Section */}
                <section className="max-w-3xl mx-auto mt-12">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Dukungan & Komentar ({story.comment_count})
                    </h2>

                    {/* Comment Input */}
                    {token ? (
                        <div className="mb-8">
                            <StoryCommentInput
                                onSubmit={handleSubmitComment}
                                isLoading={commentLoading}
                                placeholder="Berikan dukungan atau komentar positif..."
                            />
                        </div>
                    ) : (
                        <div className="bg-muted/50 rounded-lg p-4 mb-8 text-center">
                            <p className="text-muted-foreground mb-3">
                                Masuk untuk memberikan dukungan
                            </p>
                            <Link href="/login">
                                <Button size="sm">
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Masuk
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Comments List */}
                    <StoryCommentsList
                        comments={comments}
                        onHeartComment={token ? handleCommentHeart : undefined}
                        isAdmin={user?.role === "admin" || user?.role === "moderator"}
                        currentUserId={user?.id}
                    />

                    {/* Load More Comments */}
                    {totalCommentPages > 1 && commentPage < totalCommentPages && (
                        <div className="text-center mt-6">
                            <Button
                                variant="outline"
                                onClick={() => fetchComments(commentPage + 1)}
                            >
                                Muat Lebih Banyak
                            </Button>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
