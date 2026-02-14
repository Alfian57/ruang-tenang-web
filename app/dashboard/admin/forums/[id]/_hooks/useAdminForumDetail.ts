"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { forumService } from "@/services/api";
import { Forum, ForumPost } from "@/types/forum";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export function useAdminForumDetail() {
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

  // Delete confirmation states
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
  const [showDeleteForumDialog, setShowDeleteForumDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = parseInt(params.id as string);

  const fetchForum = useCallback(async () => {
    if (!token) return;
    try {
      const res = await forumService.getById(token, id);
      setForum(res.data);
      setIsLiked(!!res.data.is_liked);
      setLikesCount(res.data.likes_count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat topik");
    }
  }, [id, token]);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    try {
      const response = await forumService.getPosts(token, id, 100);
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (id && token) {
      fetchForum();
      fetchPosts();
    }
  }, [id, token, fetchForum, fetchPosts]);

  const handleReply = async () => {
    if (!replyContent.trim() || !token) return;

    setSubmitting(true);
    try {
      await forumService.createPost(token, id, { content: replyContent });
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
      await forumService.delete(token, id);
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
    if (!token) return;
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await forumService.toggleLike(token, id);
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
