"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { forumService } from "@/services/api";
import { Forum, ForumPost } from "@/types/forum";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const SORT_STORAGE_KEY = "forum_sort_preference";

type SortOption = "top" | "newest" | "oldest";

export function useForumThread() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Sort preference
  const [sortOrder, setSortOrderState] = useState<SortOption>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(SORT_STORAGE_KEY) as SortOption) || "top";
    }
    return "top";
  });

  // Delete confirmation states
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
  const [showDeleteForumDialog, setShowDeleteForumDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const slug = params.slug as string;
  const isAdmin = user?.role === "admin";

  const setSortOrder = useCallback((sort: SortOption) => {
    setSortOrderState(sort);
    if (typeof window !== "undefined") {
      localStorage.setItem(SORT_STORAGE_KEY, sort);
    }
  }, []);

  const fetchForum = useCallback(async () => {
    if (!token) return;
    try {
      const response = await forumService.getBySlug(token, slug);
      if (response.data) {
        setForum(response.data);
        setIsLiked(!!response.data.is_liked);
        setLikesCount(response.data.likes_count || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat topik");
    }
  }, [slug, token]);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    try {
      const response = await forumService.getPosts(token, slug, 100, 0, sortOrder);
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [slug, token, sortOrder]);

  useEffect(() => {
    if (slug && token) {
      fetchForum();
      fetchPosts();
    }
  }, [slug, token, fetchForum, fetchPosts]);

  const handleReply = async () => {
    if (!replyContent.trim() || !token) return;

    setSubmitting(true);
    try {
      await forumService.createPost(token, slug, { content: replyContent });
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
    if (!token) return;
    setIsDeleting(true);
    try {
      await forumService.delete(token, slug);
      toast.success("Topik dihapus");
      router.push("/dashboard/forum");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus topik");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = async () => {
    if (!token) return;
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await forumService.toggleLike(token, slug);
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
    const previousPosts = posts;
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
      // Rollback on error
      setPosts(previousPosts);
      toast.error("Gagal melike balasan");
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
    token,
    isAdmin,
    router,
    forum,
    posts,
    loading,
    replyContent,
    submitting,
    isLiked,
    likesCount,
    sortOrder,
    deletePostId,
    showDeletePostDialog,
    showDeleteForumDialog,
    isDeleting,
    setReplyContent,
    setSortOrder,
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
