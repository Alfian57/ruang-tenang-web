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
  Send,
  Mic,
  Square,
  Loader2,
  Play,
  Pause
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
import { api, getUploadUrl } from "@/lib/api";
import { ChatSession, ChatMessage } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

type FilterType = "all" | "favorites" | "trash";

// Audio Player Component
const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioDuration = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 bg-gray-100/50 p-2 rounded-xl min-w-[200px]">
      <audio ref={audioRef} src={getUploadUrl(src)} preload="metadata" />
      <Button
        size="icon"
        variant="ghost"
        className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-gray-50"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
      </Button>
      <div className="flex-1 space-y-1">
        <div className="h-1 bg-gray-200 rounded-full w-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

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

  // Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Gagal mengakses mikrofon. Pastikan izin telah diberikan.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecordingStop = async () => {
    if (!token || !activeSession) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
    const audioFile = new File([audioBlob], "voice-note.mp3", { type: "audio/mp3" });

    setIsSending(true);

    try {
      // Upload audio first
      const uploadRes = await api.uploadAudio(token, audioFile);
      const audioUrl = uploadRes.data.url;

      // Send message with type audio
      // Note: We're sending the URL as content for now, or we could adjust the API to handle type separately properly
      // Based on previous plan, we added Type to model. We need to handle this in sendMessage API too? 
      // Checking api.sendMessage in implementation: existing one only takes content.
      // We'll treat content as URL for audio type.
      
      // Since existing api.sendMessage doesn't support 'type' param yet, we might need to update it or 
      // rely on backend detection? But plan said "Update sendMessage: Include type: 'audio' in payload".
      // I need to update api.sendMessage first? Or just pass it in body.
      // Let's assume I will update api.ts to accept type or just assume backend handles it if I modify api.ts call here.
      // Wait, api.ts is strict. I need to update it as well. 
      // For now, I'll modify the call here to be custom since api.ts modification is separate.
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/chat-sessions/${activeSession.id}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            content: audioUrl,
            type: "audio"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
        
       setMessages(prev => [...prev, data.data.user_message as ChatMessage, data.data.ai_message as ChatMessage]);
       setSessions(prev => prev.map(s => 
          s.id === activeSession.id ? { ...s, last_message: "🎤 Pesan Suara" } : s
       ));

    } catch (error) {
        console.error("Failed to send voice note:", error);
        alert("Gagal mengirim pesan suara");
    } finally {
        setIsSending(false);
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
      type: "text",
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
    // ... (existing code same as before, no changes needed here)
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
        if (filter !== "trash") {
          setActiveSession(null);
          setMessages([]);
        } else {
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

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {/* Messages Area */}
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
                  
                  <div className="max-w-[85%] lg:max-w-[75%] space-y-2">
                    <div
                      className={cn(
                        "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        message.role === "user"
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      )}
                    >
                      {message.type === 'audio' ? (
                          <div className={cn("py-1", message.role === 'user' ? "brightness-0 invert" : "")}>
                              <AudioPlayer src={message.content} />
                          </div>
                      ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {/* Message metadata */}
                    <div className={cn(
                      "flex items-center gap-2 text-xs text-gray-400",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}>
                      <span>{formatDate(message.created_at)}</span>
                      
                      {message.role === "ai" && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {message.type !== 'audio' && (
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
                          )}
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
                    <span className="text-xs text-gray-500 font-medium animate-pulse">
                        {isRecording ? "Mengirim suara..." : "Sedang mengetik..."}
                    </span>
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
              <div className="max-w-4xl mx-auto flex items-center justify-center mb-2">
                 <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    ✨ 10 EXP / hari
                 </span>
              </div>
              <div className="max-w-4xl mx-auto flex items-end gap-2">
                {isRecording ? (
                    <div className="flex-1 bg-red-50 rounded-2xl border border-red-100 p-2 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3 px-2">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                             <span className="text-sm font-bold text-red-600 tabular-nums">
                                 {formatRecordingTime(recordingDuration)}
                             </span>
                        </div>
                        <Button 
                            onClick={stopRecording}
                            variant="destructive"
                            size="sm"
                            className="rounded-xl h-8 px-4"
                        >
                            <Square className="w-3 h-3 mr-2" /> Hentikan & Kirim
                        </Button>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                        }}
                        className="flex-1 flex items-end gap-2"
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
                            type="button" // Important: type button so it doesn't submit form
                            onClick={startRecording}
                            disabled={isSending || !!input.trim()} // Disable mic if typing
                            size="icon"
                            variant="ghost"
                            className="rounded-xl w-8 h-8 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mr-1"
                            title="Rekam Suara"
                        >
                            <Mic className="w-4 h-4" />
                        </Button>
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
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
           {/* Empty State remains same */}
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 animate-pulse">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Mulai Percakapan Baru</h3>
            <p className="text-gray-500 max-w-sm mb-2 leading-relaxed text-sm">
              Ceritakan apa yang sedang kamu rasakan. AI kami siap mendengarkan.
            </p>
            <div className="mb-6 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
              ✨ Dapatkan 10 EXP per respon AI (Maks 1x/hari)
            </div>
            <Button 
              onClick={() => setNewSessionDialog(true)} 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-4 h-auto text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Buat Obrolan Baru
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Sessions List (Unchanged content-wise) */}
      <div className="w-80 border-l bg-white hidden lg:flex flex-col h-full shadow-[-1px_0_10px_rgba(0,0,0,0.02)] z-10">
         {/* ... sidebar content ... reuse existing code structure ... */}
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

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {/* Same session list mapping */}
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
                   {/* ... session item content ... */}
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
                             {/* ... dropdown content ... */}
                            <DropdownMenuItem onClick={(e) => toggleFavorite(e, session.id)}>
                                <Heart className={cn("w-4 h-4 mr-2", session.is_favorite && "fill-red-500 text-red-500")} />
                                {session.is_favorite ? "Hapus Favorit" : "Favorit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => toggleTrash(e, session.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Pindahkan ke Sampah
                            </DropdownMenuItem>
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

       {/* New Session Dialog & Delete Modal - Keeping them */}
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


