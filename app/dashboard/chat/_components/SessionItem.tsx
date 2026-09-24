"use client";

import { Heart, Mic, MoreVertical, Trash2, Folder, FolderOutput, MessageSquare, NotebookPen } from "lucide-react";
import { cn } from "@/utils";
import { ChatSession, ChatFolder } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isTrashView: boolean;
  folders?: ChatFolder[];
  compact?: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: string) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: string) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: string) => void;
  onMoveToFolder?: (sessionId: string, folderId: number | null) => void;
}

export function SessionItem({
  session,
  isActive,
  isTrashView,
  folders = [],
  compact = false,
  onSelect,
  onToggleFavorite,
  onToggleTrash,
  onDeletePermanent,
  onMoveToFolder,
}: SessionItemProps) {
  const isVoiceMessage = session.last_message?.includes("Pesan Suara") ?? false;

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-all focus-within:ring-2 focus-within:ring-rose-400",
        compact ? "p-2" : "p-3",
        isActive
          ? "border-rose-200 bg-rose-50/80 shadow-sm"
          : "border-transparent bg-white/80 hover:border-rose-100 hover:bg-white hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onSelect} aria-current={isActive ? "page" : undefined} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none">
                {!compact && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isActive ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                  )}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-medium truncate",
                        compact ? "text-xs" : "text-sm",
                        isActive ? "text-primary" : "text-gray-900"
                      )}
                    >
                      {session.title}
                    </p>
                    {session.is_favorite && (
                      <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
                    )}
                    {session.has_summary && (
                      <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary/80 rounded"><NotebookPen className="w-3 h-3" /></span>
                    )}
                  </div>
                  {!compact && (
                    <p className="flex items-center gap-1 text-xs text-gray-500 truncate mt-0.5">
                      {isVoiceMessage && <Mic className="h-3 w-3 shrink-0" aria-hidden="true" />}
                      <span className="truncate">{isVoiceMessage ? "Pesan Suara" : session.last_message || "Tidak ada pesan"}</span>
                    </p>
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{session.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className={cn(
              "shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            )}
            aria-label={`Opsi untuk ${session.title}`}>
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isTrashView ? (
              <>
                <DropdownMenuItem onClick={(e) => onToggleTrash(e, session.uuid)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Pulihkan
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => onDeletePermanent?.(e, session.uuid)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Permanen
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={(e) => onToggleFavorite(e, session.uuid)}>
                  <Heart
                    className={cn(
                      "w-4 h-4 mr-2",
                      session.is_favorite && "fill-red-500 text-red-500"
                    )}
                  />
                  {session.is_favorite ? "Hapus Favorit" : "Favorit"}
                </DropdownMenuItem>

                {/* Move to folder submenu */}
                {folders.length > 0 && onMoveToFolder && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderOutput className="w-4 h-4 mr-2" />
                      Pindah ke Folder
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onMoveToFolder(session.uuid, null);
                      }}>
                        <Folder className="w-4 h-4 mr-2 text-gray-400" />
                        Tanpa Folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {folders.map((folder) => (
                        <DropdownMenuItem
                          key={folder.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToFolder(session.uuid, folder.id);
                          }}
                        >
                          <Folder className="w-4 h-4 mr-2" style={{ color: folder.color }} />
                          {folder.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => onToggleTrash(e, session.uuid)}
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
