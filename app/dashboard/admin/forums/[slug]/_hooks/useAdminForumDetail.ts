"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/services/api";
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
      const res = await adminService.getForum(token, slug as string);
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
      const response = await adminService.getForumPosts(token, slug as string, { limit: 100, sort: "top" });
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
      await adminService.createForumPost(token, slug as string, { content: replyContent });
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
      await adminService.deleteForumPost(token, deletePostId);
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
      await adminService.deleteForum(token, slug as string);
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
    toast.info("Mode admin hanya menampilkan jumlah suka. Interaksi suka tersedia untuk user.");
  };
  
  const handleTogglePostLike = async (post: ForumPost) => {
    void post;
    toast.info("Mode admin hanya menampilkan jumlah suka. Interaksi suka tersedia untuk user.");
  };

  const handleToggleBestAnswer = async (post: ForumPost) => {
    if (!token) return;
    
    const isBest = !(post.is_accepted_answer ?? post.is_best_answer ?? false);
    
    // Optimistic Update
    const updatedPosts = posts.map(p => {
      if (p.id === post.id) return { ...p, is_accepted_answer: isBest, is_best_answer: isBest };
      if (isBest) return { ...p, is_accepted_answer: false, is_best_answer: false }; 
      return p;
    });
    setPosts(updatedPosts);
    
    try {
      await adminService.toggleAcceptedAnswer(token, post.id);
      fetchPosts();
      fetchForum();
      toast.success(isBest ? "Ditandai sebagai Jawaban Terbaik" : "Status Jawaban Terbaik dihapus");
    } catch (error) {
       console.error(error);
       toast.error("Gagal mengubah status jawaban terbaik");
    }
  };

  const handleToggleForumAccess = async (userId: number) => {
    if (!token) return;

    try {
      await adminService.toggleForumBlock(token, userId);
      toast.success("Status akses forum pengguna diperbarui");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui akses forum pengguna");
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
    handleToggleBestAnswer,
    handleToggleForumAccess
  };
}
