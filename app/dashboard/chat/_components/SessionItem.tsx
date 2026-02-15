"use client";

import { Heart, MoreVertical, Trash2, Folder, FolderOutput, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
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
  onToggleFavorite: (e: React.MouseEvent, sessionId: number) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: number) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: number) => void;
  onMoveToFolder?: (sessionId: number, folderId: number | null) => void;
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
  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-lg cursor-pointer transition-colors group relative border",
        compact ? "p-2" : "p-3",
        isActive
          ? "bg-red-50 border-primary/20"
          : "hover:bg-gray-50 bg-white border-transparent"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 flex-1 flex items-center gap-3">
                {!compact && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
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
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">📝</span>
                    )}
                  </div>
                  {!compact && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {session.last_message || "Tidak ada pesan"}
                    </p>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{session.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className={cn(
              "p-1 text-gray-400 hover:text-gray-600 shrink-0 transition-opacity",
              compact ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
                        onMoveToFolder(session.id, null);
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
                            onMoveToFolder(session.id, folder.id);
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
