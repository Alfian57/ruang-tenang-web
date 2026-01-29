"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Forum, ForumPost } from "@/types/forum";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Trash2, Clock, Heart, MessageSquare, Share2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ForumTopicPage() {
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
  
  const id = parseInt(params.id as string);
  const isAdmin = user?.role === "admin";

  const fetchForum = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getForumByID(token, id);
      setForum(data);
      setIsLiked(!!data.is_liked); // Needs to be added to type
      setLikesCount(data.likes_count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat topik");
    }
  }, [id, token]);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.getForumPosts(token, id, 100);
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
      await api.createForumPost(token, id, { content: replyContent });
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

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Hapus balasan ini?") || !token) return;
    try {
      await api.deleteForumPost(token, postId);
      setPosts(posts.filter(p => p.id !== postId));
      toast.success("Balasan dihapus");
    } catch (error) {
       console.error(error);
       toast.error("Gagal menghapus balasan");
    }
  };
  
  const handleDeleteForum = async () => {
      if (!confirm("Hapus topik diskusi ini selamanya?") || !token) return;
      try {
          await api.deleteForum(token, id);
          toast.success("Topik dihapus");
          router.push("/dashboard/forum");
      } catch (error) {
          console.error(error);
          toast.error("Gagal menghapus topik");
      }
  }

  const handleToggleLike = async () => {
    if (!token) return;
    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await api.toggleForumLike(token, id);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error("Gagal memproses like");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat diskusi...</div>;
  if (!forum) return <div className="p-10 text-center text-gray-500">Topik tidak ditemukan</div>;

  const isOwner = user?.id === forum.user_id;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
               {forum.category && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wide">
                    {forum.category.name}
                  </span>
               )}
               <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(forum.created_at), { addSuffix: true, locale: idLocale })}</span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-800 line-clamp-1">{forum.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {(isOwner || isAdmin) && (
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={handleDeleteForum}>
                    <Trash2 className="w-5 h-5" />
                </Button>
            )}
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Main Topic Content */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {forum.user?.name?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <p className="font-semibold text-gray-900">{forum.user?.name}</p>
                        <p className="text-xs text-gray-500">Penulis</p>
                     </div>
                  </div>
               </div>
               
               <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {forum.content}
               </div>
               
               <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2 hover:bg-red-50 hover:text-red-500 transition-colors",
                      isLiked && "text-red-500 bg-red-50"
                    )}
                    onClick={handleToggleLike}
                  >
                     <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                     <span>{likesCount} Suka</span>
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2">
                     <MessageSquare className="w-4 h-4" />
                     <span>{posts.length} Balasan</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 ml-auto text-gray-500">
                     <Share2 className="w-4 h-4" />
                     <span className="hidden sm:inline">Bagikan</span>
                  </Button>
               </div>
            </div>
            
            
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider font-medium">
                    <span className="bg-gray-50 px-3 text-gray-400">Balasan</span>
                </div>
            </div>

            {/* Reply Input */}
            <div className="bg-white border p-4 rounded-xl shadow-sm mb-6">
                <div className="mb-3 flex items-center gap-2">
                   <div className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium border border-yellow-200">
                      ✨ 5 EXP / komentar (Maks 5x/hari)
                   </div>
                </div>
                <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Textarea 
                    placeholder="Tulis balasan Anda..." 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[44px] max-h-[120px] resize-none pr-12 py-3 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    style={{ height: '44px' }} // Initial height
                    />
                </div>
                <Button className="h-[44px] w-[44px] p-0 shrink-0 rounded-xl" disabled={!replyContent.trim() || submitting} onClick={handleReply}>
                    {submitting ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
                </div>
            </div>
    
            {/* Posts List */}
            <div className="space-y-4 pb-4">
              {posts.map((post) => (
                <div key={post.id} className="flex gap-3 group">
                   <div className="shrink-0">
                       <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                {post.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                       </div>
                   </div>
                   <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-semibold text-gray-900">{post.user?.name}</span>
                             <span className="text-xs text-gray-400">•</span>
                             <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: idLocale })}</span>
                          </div>
                          {(user?.id === post.user_id || isAdmin) && (
                              <button 
                                onClick={() => handleDeletePost(post.id)} 
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Hapus balasan"
                              >
                                  <Trash2 className="w-3 h-3" />
                              </button>
                          )}
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                   </div>
                </div>
              ))}
              
              {posts.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                         <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-gray-500 text-sm">Belum ada balasan. Jadilah yang pertama!</p>
                  </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
