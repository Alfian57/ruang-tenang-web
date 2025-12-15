"use client";

import Image from "next/image";
import { Plus, Heart, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatSession } from "@/types";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "favorites" | "trash";

interface FilterOption {
  key: FilterType;
  icon: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", icon: "/images/history.png", label: "Riwayat" },
  { key: "favorites", icon: "/images/favorite.png", label: "Favorit" },
  { key: "trash", icon: "/images/trash.png", label: "Sampah" },
];

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onSessionSelect: (sessionId: number) => void;
  onCreateSession: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: number) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: number) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: number) => void;
}

/**
 * Sidebar component displaying chat session list with filtering options.
 */
export function ChatSidebar({
  sessions,
  activeSessionId,
  filter,
  onFilterChange,
  onSessionSelect,
  onCreateSession,
  onToggleFavorite,
  onToggleTrash,
  onDeletePermanent,
}: ChatSidebarProps) {
  return (
    <div className="w-80 border-l bg-white hidden lg:flex flex-col h-full shadow-[-1px_0_10px_rgba(0,0,0,0.02)] z-10">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">Riwayat Chat</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
            {sessions.length}
          </span>
        </div>
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all h-9 text-xs"
          onClick={onCreateSession}
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Chat Baru
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="p-4 space-y-1 border-b">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onFilterChange(opt.key)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
              filter === opt.key
                ? "bg-red-50 text-primary"
                : "hover:bg-gray-50 text-gray-600"
            )}
          >
            <div className="flex items-center gap-3">
              <Image src={opt.icon} alt="" width={16} height={16} />
              <span>{opt.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-2">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                isTrashView={filter === "trash"}
                onSelect={() => onSessionSelect(session.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleTrash={onToggleTrash}
                onDeletePermanent={onDeletePermanent}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Belum ada percakapan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isTrashView: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: number) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: number) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: number) => void;
}

function SessionItem({
  session,
  isActive,
  isTrashView,
  onSelect,
  onToggleFavorite,
  onToggleTrash,
  onDeletePermanent,
}: SessionItemProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors group relative border",
        isActive
          ? "bg-red-50 border-primary/20"
          : "hover:bg-gray-50 bg-white border-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-medium text-sm truncate",
                isActive ? "text-primary" : "text-gray-900"
              )}
            >
              {session.title}
            </p>
            {session.is_favorite && (
              <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
            )}
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
            {isTrashView ? (
              <>
                <DropdownMenuItem onClick={(e) => onToggleTrash(e, session.id)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Pulihkan
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => onDeletePermanent?.(e, session.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Permanen
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={(e) => onToggleFavorite(e, session.id)}>
                  <Heart
                    className={cn(
                      "w-4 h-4 mr-2",
                      session.is_favorite && "fill-red-500 text-red-500"
                    )}
                  />
                  {session.is_favorite ? "Hapus Favorit" : "Favorit"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => onToggleTrash(e, session.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Pindahkan ke Sampah
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
