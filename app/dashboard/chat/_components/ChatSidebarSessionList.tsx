import { ChatFolder, ChatSession } from "@/types";
import { ChevronRight, ChevronDown, MessageCircle } from "lucide-react";
import { SessionItem } from "./SessionItem";
import { FilterType } from "./types";

interface ChatSidebarSessionListProps {
  sessions: ChatSession[];
  folders: ChatFolder[];
  filter: FilterType;
  activeFolderId: number | null;
  activeSessionId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSessionSelect: (sessionId: string) => void;
  onClose?: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: string) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: string) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: string) => void;
  onMoveToFolder?: (sessionId: string, folderId: number | null) => void;
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
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-500">
          {activeFolderId ? "Folder kosong" : "Belum ada percakapan"}
        </h3>
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
              isActive={activeSessionId === session.uuid}
              isTrashView={filter === "trash"}
              folders={folders}
              onSelect={() => {
                onSessionSelect(session.uuid);
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
