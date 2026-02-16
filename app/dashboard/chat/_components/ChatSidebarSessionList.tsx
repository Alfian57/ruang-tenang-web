import { ChatFolder, ChatSession } from "@/types";
import { ChevronRight, ChevronDown } from "lucide-react";
import { SessionItem } from "./SessionItem";
import { FilterType } from "./types";

interface ChatSidebarSessionListProps {
  sessions: ChatSession[];
  folders: ChatFolder[];
  filter: FilterType;
  activeFolderId: number | null;
  activeSessionId: number | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSessionSelect: (sessionId: number) => void;
  onClose?: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: number) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: number) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: number) => void;
  onMoveToFolder?: (sessionId: number, folderId: number | null) => void;
}

export function ChatSidebarSessionList({
  sessions,
  folders,
  filter,
  activeFolderId,
  activeSessionId,
  isCollapsed,
  onToggleCollapse,
  onSessionSelect,
  onClose,
  onToggleFavorite,
  onToggleTrash,
  onDeletePermanent,
  onMoveToFolder,
}: ChatSidebarSessionListProps) {
  // Determine if we should show the "Chat Lainnya" header
  const showUnassignedHeader = folders.length > 0 && filter === "all" && !activeFolderId;

  // If header is shown and collapsed, hide content
  const hideContent = showUnassignedHeader && isCollapsed;

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">
          {activeFolderId ? "Folder kosong" : "Belum ada percakapan"}
        </p>
      </div>
    );
  }

  return (
    <>
      {showUnassignedHeader && (
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-xs font-medium text-gray-500 mb-3 px-1 hover:text-gray-700 transition-colors"
        >
          <span>Chat Lainnya</span>
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {!hideContent && (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={activeSessionId === session.id}
              isTrashView={filter === "trash"}
              folders={folders}
              onSelect={() => {
                onSessionSelect(session.id);
                if (onClose) onClose();
              }}
              onToggleFavorite={onToggleFavorite}
              onToggleTrash={onToggleTrash}
              onDeletePermanent={onDeletePermanent}
              onMoveToFolder={onMoveToFolder}
            />
          ))}
        </div>
      )}
    </>
  );
}
