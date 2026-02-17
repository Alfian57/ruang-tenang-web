"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { forumService } from "@/services/api";
import { Forum, ForumPost } from "@/types/forum";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export function useAdminForumDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Delete confirmation states
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
  const [showDeleteForumDialog, setShowDeleteForumDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // No longer parsing ID as int
  // const id = parseInt(params.id as string);

  const fetchForum = useCallback(async () => {
    if (!token || !slug) return;
    try {
      const res = await forumService.getBySlug(token, slug as string);
      setForum(res.data);
      setIsLiked(!!res.data.is_liked);
      setLikesCount(res.data.likes_count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat topik");
    }
  }, [slug, token]);

  const fetchPosts = useCallback(async () => {
    if (!token || !slug) return;
    try {
      // Use getPosts but we need forum ID. But the backend for getPosts uses forumId.
      // Actually forumService.getPosts takes forumId (string | number).
      // If we use slug, we might need a different endpoint or get ID first.
      // Wait, forumService.getPosts calls /forums/${forumId}/posts.
      // Does backend support slug there? Checking router.go...
      // router.go: forum.GET("/:slug/posts", forumHandler.GetForumPosts)
      // Yes! It supports slug!
      const response = await forumService.getPosts(token, slug as string, 100);
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  useEffect(() => {
    if (slug && token) {
      fetchForum();
      fetchPosts();
    }
  }, [slug, token, fetchForum, fetchPosts]);

  const handleReply = async () => {
    if (!replyContent.trim() || !token || !slug) return;

    setSubmitting(true);
    try {
      // forumService.createPost expects forumId. 
      // Checking router.go: forum.POST("/:slug/posts", forumHandler.CreateForumPost)
      // Yes, supports slug!
      await forumService.createPost(token, slug as string, { content: replyContent });
      setReplyContent("");
      fetchPosts();
      fetchForum(); // Update reply count if needed
      toast.success("Balasan terkirim");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim balasan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostId || !token) return;
    setIsDeleting(true);
    try {
      await forumService.deletePost(token, deletePostId);
      setPosts(posts.filter(p => p.id !== deletePostId));
      toast.success("Balasan dihapus");
      setShowDeletePostDialog(false);
      setDeletePostId(null);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus balasan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteForum = async () => {
    if (!token || !slug) return;
    setIsDeleting(true);
    try {
      // route: forum.DELETE("/:slug", forumHandler.DeleteForum)
      // Supports slug!
      await forumService.delete(token, slug as string);
      toast.success("Topik dihapus");
      router.push("/dashboard/admin/forums");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus topik");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = async () => {
    if (!token || !slug) return;
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      // route: forum.PUT("/:slug/like", forumHandler.ToggleLike)
      // Supports slug!
      await forumService.toggleLike(token, slug as string);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error("Gagal memproses like");
    }
  };
  
  const handleTogglePostLike = async (post: ForumPost) => {
    if (!token) return;
    
    // Optimistic Update
    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        const isLiked = !p.is_liked;
        return {
          ...p,
          is_liked: isLiked,
          likes_count: (p.likes_count || 0) + (isLiked ? 1 : -1)
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    
    try {
      await forumService.upvotePost(token, post.id);
    } catch (error) {
      console.error(error);
      toast.error("Gagal melike balasan");
      // Revert would go here
    }
  };

  const handleToggleBestAnswer = async (post: ForumPost) => {
    if (!token) return;
    
    const isBest = !post.is_best_answer;
    
    // Optimistic Update
    const updatedPosts = posts.map(p => {
      if (p.id === post.id) return { ...p, is_best_answer: isBest };
      if (isBest) return { ...p, is_best_answer: false }; 
      return p;
    });
    setPosts(updatedPosts);
    
    try {
      await forumService.markAcceptedAnswer(token, post.id);
      toast.success(isBest ? "Ditandai sebagai Jawaban Terbaik" : "Status Jawaban Terbaik dihapus");
    } catch (error) {
       console.error(error);
       toast.error("Gagal mengubah status jawaban terbaik");
    }
  };

  return {
    user,
    token, // Exporting token if component needs it, though unlikely with hook logic encapsulation
    forum,
    posts,
    loading,
    replyContent,
    submitting,
    isLiked,
    likesCount,
    deletePostId,
    showDeletePostDialog,
    showDeleteForumDialog,
    isDeleting,
    router, // Exporting router if component needs to navigate back manually (it does)
    setReplyContent,
    setDeletePostId,
    setShowDeletePostDialog,
    setShowDeleteForumDialog,
    handleReply,
    handleDeletePost,
    handleDeleteForum,
    handleToggleLike,
    handleTogglePostLike,
    handleToggleBestAnswer
  };
}
