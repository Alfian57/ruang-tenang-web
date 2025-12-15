"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Plus, MessageCircle, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { ChatSession, ChatMessage } from "@/types";
import { cn, formatDate } from "@/lib/utils";

type FilterType = "all" | "favorites" | "bookmarked" | "trash";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessions = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.getChatSessions(token, { filter }) as { data: ChatSession[] };
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
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleBookmark = async (sessionId: number) => {
    if (!token) return;
    try {
      await api.toggleBookmark(token, sessionId);
      loadSessions();
      if (activeSession?.id === sessionId) {
        setActiveSession(prev => prev ? { ...prev, is_bookmarked: !prev.is_bookmarked } : null);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const toggleMessageLike = async (messageId: number, isLike: boolean) => {
    if (!token) return;
    try {
      // TODO: Implement backend endpoint
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_liked: isLike ? !msg.is_liked : false, is_disliked: !isLike ? !msg.is_disliked : false }
          : msg
      ));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteSession = async (sessionId: number) => {
    if (!token) return;
    try {
      await api.deleteChatSession(token, sessionId);
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
      loadSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const filterOptions = [
    { key: "all" as FilterType, icon: "/images/history.png", label: "Riwayat", count: sessions.length },
    { key: "favorites" as FilterType, icon: "/images/favorite.png", label: "Favorit", count: 0 },
    { key: "bookmarked" as FilterType, icon: "/images/bookmark.png", label: "di Tandai", count: 0 },
    { key: "trash" as FilterType, icon: "/images/trash.png", label: "Sampah", count: 0 },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex">
      {/* Left Sidebar - Navigation (hidden on mobile) */}
      <div className="hidden md:flex w-16 flex-col items-center py-4 border-r bg-white">
        {/* This sidebar can be used for additional navigation if needed */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeSession ? (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 lg:p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "ai" && (
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className="bg-transparent">
                          <Image src="/images/ai-profile.png" alt="AI" width={40} height={40} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="max-w-[70%] space-y-2">
                      <div
                        className={cn(
                          "px-4 py-3",
                          message.role === "user"
                            ? "chat-bubble-user"
                            : "chat-bubble-ai"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Message metadata */}
                      <div className={cn(
                        "flex items-center gap-2 text-xs text-gray-400",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}>
                        <span>{formatDate(message.created_at)}</span>
                        
                        {message.role === "ai" && (
                          <div className="flex items-center gap-1">
                            <button 
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button 
                              className={cn(
                                "p-1 hover:bg-gray-100 rounded",
                                message.is_liked && "text-primary"
                              )}
                              onClick={() => toggleMessageLike(message.id, true)}
                              title="Like"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button 
                              className={cn(
                                "p-1 hover:bg-gray-100 rounded",
                                message.is_disliked && "text-primary"
                              )}
                              onClick={() => toggleMessageLike(message.id, false)}
                              title="Dislike"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className="bg-primary text-white">
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
                    <div className="chat-bubble-ai px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="max-w-3xl mx-auto flex gap-2"
              >
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Kirim Pesanmu ke AI Chat...."
                    disabled={isSending}
                    className="pr-12 rounded-full border-gray-200 bg-gray-50"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isSending} 
                  className="gradient-primary rounded-full w-12 h-12 p-0"
                >
                  <Image src="/images/send.png" alt="Send" width={20} height={20} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Mulai Percakapan</h3>
              <p className="text-gray-500 text-sm mb-4">
                Pilih sesi atau buat sesi baru untuk memulai
              </p>
              <Button onClick={() => setNewSessionDialog(true)} className="gradient-primary rounded-full px-6">
                <Plus className="w-4 h-4 mr-2" /> Buat Obrolan Baru
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Sessions */}
      <div className="w-80 border-l bg-white hidden lg:flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pesan <span className="text-gray-400">({sessions.length})</span></h2>
          </div>
          <Button 
            className="w-full gradient-primary rounded-full" 
            onClick={() => setNewSessionDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Buat Obrolan Baru
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-1 border-b">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                filter === opt.key ? "bg-red-50 text-primary" : "hover:bg-gray-50 text-gray-600"
              )}
            >
              <div className="flex items-center gap-3">
                <Image src={opt.icon} alt="" width={16} height={16} />
                <span>{opt.label}</span>
              </div>
              <span className="text-gray-400">{opt.count}</span>
            </button>
          ))}
        </div>

        {/* Session List */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Riwayat</span>
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    activeSession?.id === session.id 
                      ? "bg-red-50 border border-primary/20" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{session.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {session.last_message || "Tidak ada pesan"}
                      </p>
                    </div>
                    <button 
                      className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show options menu
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* New Session Dialog */}
      <Dialog open={newSessionDialog} onOpenChange={setNewSessionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Obrolan Baru</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Judul sesi (contoh: Curhat hari ini)"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSessionDialog(false)} className="rounded-full">
              Batal
            </Button>
            <Button 
              onClick={createSession} 
              disabled={!newSessionTitle.trim()} 
              className="gradient-primary rounded-full"
            >
              Buat Sesi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}
