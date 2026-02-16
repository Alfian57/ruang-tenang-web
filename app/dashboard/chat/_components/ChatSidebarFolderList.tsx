import { ChatFolder, ChatSession } from "@/types";
import { Folder, ChevronRight, ChevronDown, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionItem } from "./SessionItem";

interface ChatSidebarFolderListProps {
  folders: ChatFolder[];
  sessionsByFolder: Record<string | number, ChatSession[]>;
  expandedFolders: Set<number>;
  activeFolderId: number | null;
  activeSessionId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleExpand: (folderId: number) => void;
  onFolderSelect: (folderId: number) => void;
  onSessionSelect: (sessionId: string) => void;
  onClose?: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: string) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: string) => void;
  onMoveToFolder?: (sessionId: string, folderId: number | null) => void;
  openEditFolder: (folder: ChatFolder) => void;
  onDeleteFolder?: (folderId: number) => void;
}

export function ChatSidebarFolderList({
  folders,
  sessionsByFolder,
  expandedFolders,
  activeFolderId,
  activeSessionId,
  isCollapsed,
  onToggleCollapse,
  onToggleExpand,
  onFolderSelect,
  onSessionSelect,
  onClose,
  onToggleFavorite,
  onToggleTrash,
  onMoveToFolder,
  openEditFolder,
  onDeleteFolder,
}: ChatSidebarFolderListProps) {
  if (folders.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b">
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between text-xs font-medium text-gray-500 mb-2 px-1 hover:text-gray-700 transition-colors"
      >
        <span>Folder</span>
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {!isCollapsed && (
        <div className="space-y-1">
          {folders.map((folder) => {
            const folderSessions = sessionsByFolder[folder.id] || [];
            const isExpanded = expandedFolders.has(folder.id);
            const isActive = activeFolderId === folder.id;

            return (
              <div key={folder.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors group",
                    isActive ? "bg-red-50 text-primary" : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <button
                    onClick={() => onToggleExpand(folder.id)}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div
                    className="flex-1 flex items-center gap-2"
                    onClick={() => {
                      onFolderSelect(folder.id);
                      if (!expandedFolders.has(folder.id)) {
                        onToggleExpand(folder.id);
                      }
                    }}
                  >
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="truncate">{folder.name}</span>
                    <span className="text-xs text-gray-400">{folderSessions.length}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => openEditFolder(folder)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => onDeleteFolder?.(folder.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Folder contents */}
                {isExpanded && folderSessions.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {folderSessions.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.uuid}
                        isTrashView={false}
                        folders={folders}
                        onSelect={() => {
                          onSessionSelect(session.uuid);
                          if (onClose) onClose();
                        }}
                        onToggleFavorite={onToggleFavorite}
                        onToggleTrash={onToggleTrash}
                        onMoveToFolder={onMoveToFolder}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
