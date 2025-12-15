"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { 
  Plus, 

  MessageCircle, 
  ThumbsUp,  
  MoreVertical,
  Check,
  Copy,
  ThumbsDown,
  Trash2, 
  Heart, 
  RefreshCcw, 
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { ChatSession, ChatMessage } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

type FilterType = "all" | "favorites" | "trash";

export default function ChatPage() {
  const { user, token } = useAuthStore();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isSending, setIsSending] = useState(false);
  const [newSessionDialog, setNewSessionDialog] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopy = (content: string, messageId: number) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const loadSessions = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.getChatSessions(token, { filter, limit: 50 }) as { data: ChatSession[] };
      setSessions(response.data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, [token, filter]);

  useEffect(() => {
    if (token) {
      loadSessions();
    }
  }, [token, filter, loadSessions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSession = async (sessionId: number) => {
    if (!token) return;
    try {
      const response = await api.getChatSession(token, sessionId) as { data: ChatSession & { messages: ChatMessage[] } };
      setActiveSession(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  const createSession = async () => {
    if (!token || !newSessionTitle.trim()) return;
    try {
      const response = await api.createChatSession(token, newSessionTitle) as { data: ChatSession };
      setNewSessionDialog(false);
      setNewSessionTitle("");
      loadSessions();
      loadSession(response.data.id);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const sendMessage = async () => {
    if (!token || !activeSession || !input.trim() || isSending) return;
    
    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistic update
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "user",
      content: userMessage,
      is_liked: false,
      is_disliked: false,
      created_at: new Date().toISOString(),
    }]);

    try {
      const response = await api.sendMessage(token, activeSession.id, userMessage) as { 
        data: { user_message: ChatMessage; ai_message: ChatMessage } 
      };
      setMessages(prev => [...prev.slice(0, -1), response.data.user_message, response.data.ai_message]);
      
      // Update session last message in list
      setSessions(prev => prev.map(s => 
        s.id === activeSession.id ? { ...s, last_message: userMessage } : s
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await api.toggleFavorite(token, sessionId);
      loadSessions();
      if (activeSession?.id === sessionId) {
        setActiveSession(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const toggleTrash = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await api.toggleTrash(token, sessionId);
      loadSessions();
      if (activeSession?.id === sessionId) {
        // If we're moving current session to trash, close it or reload logic
        // If we are in "trash" view, it might stay visible, otherwise it disappears
        if (filter !== "trash") {
          setActiveSession(null);
          setMessages([]);
        } else {
          // Restore from trash
          setActiveSession(prev => prev ? { ...prev, is_trash: !prev.is_trash } : null);
        }
      }
    } catch (error) {
      console.error("Failed to toggle trash:", error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    setDeleteSessionId(sessionId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!token || !deleteSessionId) return;
    setIsDeleting(true);
    try {
      await api.deleteChatSession(token, deleteSessionId);
      if (activeSession?.id === deleteSessionId) {
        setActiveSession(null);
        setMessages([]);
      }
      loadSessions();
      setShowDeleteModal(false);
      setDeleteSessionId(null);
    } catch (error) {
      console.error("Failed to delete session:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleMessageLike = async (messageId: number, isLike: boolean) => {
    if (!token) return;
    try {
      // Optimistic update
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_liked: isLike ? !msg.is_liked : false, is_disliked: !isLike ? !msg.is_disliked : false }
          : msg
      ));
      
      if (isLike) {
        await api.toggleMessageLike(token, messageId);
      } else {
        await api.toggleMessageDislike(token, messageId);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const filterOptions = [
    { key: "all" as FilterType, icon: "/images/history.png", label: "Riwayat" },
    { key: "favorites" as FilterType, icon: "/images/favorite.png", label: "Favorit" },
    { key: "trash" as FilterType, icon: "/images/trash.png", label: "Sampah"},
  ];

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {activeSession ? (
          <>
            {/* Messages Area - Using ScrollArea from shadcn might cause double scrolling if height is not constrained */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "ai" && (
                    <Avatar className="w-10 h-10 shrink-0 mt-1">
                      <AvatarFallback className="bg-transparent">
                        <Image src="/images/ai-profile.png" alt="AI" width={40} height={40} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="max-w-[75%] space-y-2">
                    <div
                      className={cn(
                        "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        message.role === "user"
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Message metadata */}
                    <div className={cn(
                      "flex items-center gap-2 text-xs text-gray-400",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}>
                      <span>{formatDate(message.created_at)}</span>
                      
                      {message.role === "ai" && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600"
                            title="Copy"
                            onClick={() => handleCopy(message.content, message.id)}
                          >
                            {copiedMessageId === message.id ? (
                                <Check className="w-3 h-3 text-green-500" />
                            ) : (
                                <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button 
                            className={cn(
                              "p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600",
                              message.is_liked && "text-primary"
                            )}
                            onClick={() => toggleMessageLike(message.id, true)}
                            title="Like"
                          >
                            <ThumbsUp className={cn("w-3 h-3", message.is_liked && "fill-current")} />
                          </button>
                          <button 
                            className={cn(
                              "p-1 hover:bg-gray-100 rounded transition text-gray-400 hover:text-gray-600",
                              message.is_disliked && "text-primary"
                            )}
                            onClick={() => toggleMessageLike(message.id, false)}
                            title="Dislike"
                          >
                            <ThumbsDown className={cn("w-3 h-3", message.is_disliked && "fill-current")} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-10 h-10 shrink-0 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-transparent">
                      <Image src="/images/ai-profile.png" alt="AI" width={40} height={40} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium animate-pulse">Sedang mengetik</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="max-w-4xl mx-auto flex items-end gap-2"
              >
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all p-1.5 flex items-center">
                   <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pesanmu disini..."
                    disabled={isSending}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 shadow-none px-3 py-2 h-auto text-sm"
                    autoComplete="off"
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isSending} 
                    size="icon"
                    className={cn(
                      "rounded-xl w-8 h-8 shrink-0 transition-all",
                      !input.trim() ? "bg-gray-200 text-gray-400" : "bg-primary hover:bg-primary/90 text-white shadow-sm"
                    )}
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 animate-pulse">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Mulai Percakapan Baru</h3>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed text-sm">
              Ceritakan apa yang sedang kamu rasakan. AI kami siap mendengarkan.
            </p>
            <Button 
              onClick={() => setNewSessionDialog(true)} 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-4 h-auto text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Buat Obrolan Baru
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Sessions List */}
      <div className="w-80 border-l bg-white hidden lg:flex flex-col h-full shadow-[-1px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Riwayat Chat</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{sessions.length}</span>
          </div>
          <Button 
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all h-9 text-xs" 
            onClick={() => setNewSessionDialog(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> Chat Baru
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-1 border-b">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setFilter(opt.key);
                setActiveSession(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                filter === opt.key ? "bg-red-50 text-primary" : "hover:bg-gray-50 text-gray-600"
              )}
            >
              <div className="flex items-center gap-3">
                <Image src={opt.icon} alt="" width={16} height={16} />
                <span>{opt.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Riwayat</span>
          </div>
          <div className="space-y-2">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors group relative border",
                      activeSession?.id === session.id 
                        ? "bg-red-50 border-primary/20" 
                        : "hover:bg-gray-50 bg-white border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            activeSession?.id === session.id ? "text-primary" : "text-gray-900"
                          )}>
                            {session.title}
                          </p>
                          {session.is_favorite && <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {session.last_message || "Tidak ada pesan"}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 text-gray-400 hover:text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {filter === "trash" ? (
                              <>
                                <DropdownMenuItem onClick={(e) => toggleTrash(e, session.id)}>
                                  <RefreshCcw className="w-4 h-4 mr-2" /> Pulihkan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={(e) => handleDeleteClick(e, session.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Permanen
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={(e) => toggleFavorite(e, session.id)}>
                                  <Heart className={cn("w-4 h-4 mr-2", session.is_favorite && "fill-red-500 text-red-500")} />
                                  {session.is_favorite ? "Hapus Favorit" : "Favorit"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={(e) => toggleTrash(e, session.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Pindahkan ke Sampah
                                </DropdownMenuItem>
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Belum ada percakapan</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* New Session Dialog */}
      <Dialog open={newSessionDialog} onOpenChange={setNewSessionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Obrolan Baru</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Berikan judul topik (contoh: Cemas karena ujian)"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              className="rounded-xl"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSessionDialog(false)} className="rounded-xl">
              Batal
            </Button>
            <Button 
              onClick={createSession} 
              disabled={!newSessionTitle.trim()} 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              Mulai Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSession}
        title="Hapus Permanen"
        description="Sesi ini akan dihapus secara permanen dan tidak dapat dipulihkan. Lanjutkan?"
        isLoading={isDeleting}
      />
    </div>
  );
}


