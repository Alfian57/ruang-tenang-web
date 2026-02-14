"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Send, Trash2, Clock, Heart, MessageSquare, CheckCircle2, Trophy, AlertTriangle, ShieldAlert, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BlockUserButton } from "@/components/shared/moderation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminForumDetail } from "./_hooks/useAdminForumDetail";

export default function AdminForumTopicPage() {
  const {
    user,
    forum,
    posts,
    loading,
    replyContent,
    submitting,
    isLiked,
    likesCount,
    showDeletePostDialog,
    showDeleteForumDialog,
    isDeleting,
    router,
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
  } = useAdminForumDetail();

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat data forum...</div>;
  if (!forum) return <div className="p-10 text-center text-gray-500">Topik tidak ditemukan</div>;

  return (
    <>
      <ConfirmDialog
        isOpen={showDeletePostDialog}
        onClose={() => {
          setShowDeletePostDialog(false);
          setDeletePostId(null);
        }}
        onConfirm={handleDeletePost}
        title="Hapus Balasan"
        description="Apakah Anda yakin ingin menghapus balasan ini secara permanen sebagai admin?"
        confirmText="Hapus (Admin)"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={showDeleteForumDialog}
        onClose={() => setShowDeleteForumDialog(false)}
        onConfirm={handleDeleteForum}
        title="Hapus Topik Diskusi"
        description="Apakah Anda yakin ingin menghapus topik ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Topik (Admin)"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/admin/forums')} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                   <ShieldAlert className="w-3 h-3" />
                   ADMIN MODE
                </span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={() => setShowDeleteForumDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Topik (Admin)
                  </DropdownMenuItem>
                  
                  {user && user.id !== forum.user_id && (
                    <BlockUserButton
                      userId={forum.user_id}
                      userName={forum.user?.name || "User"}
                      className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                    />
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
            {forum.is_flagged && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 text-orange-800">
                <div className="bg-orange-100 p-2 rounded-full shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Status: DIBLOKIR</h3>
                  <p className="text-sm text-orange-700">
                    Topik ini sedang diblokir untuk pengguna umum. Sebagai admin, Anda masih dapat melihat dan membalas.
                  </p>
                </div>
              </div>
            )}
            
            {/* Main Topic Content */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {forum.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{forum.user?.name}</p>
                    <p className="text-xs text-gray-500">Penulis (ID: {forum.user_id})</p>
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
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Tulis balasan sebagai Admin..."
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
                <div key={post.id} className={cn("flex gap-3 group transition-all", post.is_best_answer && "translate-x-2")}>
                  <div className="shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full overflow-hidden relative flex items-center justify-center text-xs font-bold ring-2",
                      post.is_best_answer ? "bg-green-100 text-green-700 ring-green-500" : "bg-gray-200 text-gray-500 ring-transparent"
                    )}>
                      {post.is_best_answer ? <Trophy className="w-4 h-4" /> : (post.user?.name?.charAt(0).toUpperCase() || "U")}
                    </div>
                  </div>
                  <div className={cn(
                    "flex-1 p-4 rounded-2xl rounded-tl-none shadow-sm border transaction-colors relative",
                    post.is_best_answer ? "bg-green-50 border-green-200" : "bg-white"
                  )}>
                    {post.is_best_answer && (
                       <div className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                         <CheckCircle2 className="w-3 h-3" /> BEST ANSWER
                       </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-semibold", post.is_best_answer ? "text-green-800" : "text-gray-900")}>
                          {post.user?.name}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: idLocale })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-6 px-2 text-[10px] text-gray-400 hover:text-green-600 hover:bg-green-50"
                             onClick={() => handleToggleBestAnswer(post)}
                             title="Tandai sebagai Jawaban Terbaik"
                           >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Best Answer
                           </Button>
                         
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                               <MoreVertical className="w-3 h-3 text-gray-400" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDeletePostId(post.id);
                                    setShowDeletePostDialog(true);
                                  }}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus Balasan (Admin)
                                </DropdownMenuItem>
                             
                              {user && user.id !== post.user_id && (
                                  <BlockUserButton
                                    userId={post.user_id}
                                    userName={post.user?.name || "User"}
                                    className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                                  />
                              )}
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                    </div>
                    
                    <p className={cn("text-sm whitespace-pre-wrap leading-relaxed mb-3", post.is_best_answer ? "text-green-900" : "text-gray-700")}>
                      {post.content}
                    </p>

                    <div className="flex items-center gap-3 border-t border-gray-100/50 pt-2">
                          <button 
                            onClick={() => handleTogglePostLike(post)}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-medium transition-colors p-1 rounded",
                              post.is_liked ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                            )}
                          >
                            <Heart className={cn("w-3.5 h-3.5", post.is_liked && "fill-current")} />
                            {post.likes_count || 0}
                          </button>
                    </div>
                  </div>
                </div>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-sm">Belum ada balasan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
