"use client";

import { ChatSession, ChatFolder } from "@/types";
import { cn } from "@/utils";
import { useChatSidebar } from "../_hooks/useChatSidebar";
import { ChatSidebarHeader } from "./ChatSidebarHeader";
import { ChatSidebarFilter } from "./ChatSidebarFilter";
import { ChatSidebarFolderList } from "./ChatSidebarFolderList";
import { ChatSidebarSessionList } from "./ChatSidebarSessionList";
import { ChatFolderDialogs } from "./ChatFolderDialogs";
import { FilterType } from "./types";

export type { FilterType };

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  filter: FilterType;
  folders?: ChatFolder[];
  activeFolderId?: number | null;
  onFilterChange: (filter: FilterType) => void;
  onSessionSelect: (sessionId: string) => void;
  onCreateSession: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: string) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: string) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: string) => void;
  // Folder actions
  onCreateFolder?: (name: string, color?: string) => void;
  onUpdateFolder?: (folderId: number, data: { name?: string; color?: string }) => void;
  onDeleteFolder?: (folderId: number) => void;
  onMoveToFolder?: (sessionId: string, folderId: number | null) => void;
  onFolderSelect?: (folderId: number | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  filter,
  folders = [],
  activeFolderId,
  onFilterChange,
  onSessionSelect,
  onCreateSession,
  onToggleFavorite,
  onToggleTrash,
  onDeletePermanent,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onMoveToFolder,
  onFolderSelect,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const {
    newFolderDialog,
    setNewFolderDialog,
    editFolderDialog,
    setEditFolderDialog,
    newFolderName,
    setNewFolderName,
    newFolderColor,
    setNewFolderColor,
    expandedFolders,
    toggleFolderExpand,
    isFolderSectionCollapsed,
    setIsFolderSectionCollapsed,
    isUnassignedSectionCollapsed,
    setIsUnassignedSectionCollapsed,
    handleCreateFolder,
    handleUpdateFolder,
    openEditFolder,
    FOLDER_COLORS
  } = useChatSidebar({

    onCreateFolder,
    onUpdateFolder
  });

  // Group sessions by folder
  const initialSessions: Record<string | number, ChatSession[]> = {};
  const sessionsByFolder = sessions.reduce((acc, session) => {
    const folderId = session.folder_id ?? 'unassigned';
    if (!acc[folderId]) acc[folderId] = [];
    acc[folderId].push(session);
    return acc;
  }, initialSessions);

  const unassignedSessions = sessionsByFolder['unassigned'] || [];

  // Determine sessions to display in the main list
  let displaySessions = sessions;
  if (filter === "all") {
    // Show only unassigned sessions when viewing "all" with folders
    displaySessions = folders.length > 0 ? unassignedSessions : sessions;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "w-80 border-l bg-white flex-col h-full shadow-[-1px_0_10px_rgba(0,0,0,0.02)] z-50",
        "lg:flex lg:static lg:z-10", // Desktop styles
        "fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out", // Mobile styles
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <ChatSidebarHeader
          sessionCount={sessions.length}
          onClose={onClose}
          onCreateSession={onCreateSession}
          onCreateFolder={() => setNewFolderDialog(true)}
        />

        <ChatSidebarFilter
          filter={filter}
          activeFolderId={activeFolderId}
          onFilterChange={onFilterChange}
          onClearActiveFolder={() => onFolderSelect?.(null)}
        />

        {/* Folders section */}
        {folders.length > 0 && filter === "all" && (
          <ChatSidebarFolderList
            folders={folders}
            sessionsByFolder={sessionsByFolder}
            expandedFolders={expandedFolders}
            activeFolderId={activeFolderId || null}
            activeSessionId={activeSessionId}
            isCollapsed={isFolderSectionCollapsed}
            onToggleCollapse={() => setIsFolderSectionCollapsed(!isFolderSectionCollapsed)}
            onToggleExpand={toggleFolderExpand}
            onFolderSelect={(id) => onFolderSelect?.(id)}
            onSessionSelect={onSessionSelect}
            onClose={onClose}
            onToggleFavorite={onToggleFavorite}
            onToggleTrash={onToggleTrash}
            onMoveToFolder={onMoveToFolder}
            openEditFolder={openEditFolder}
            onDeleteFolder={onDeleteFolder}
          />
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {!(folders.length > 0 && filter === "all" && !activeFolderId && isUnassignedSectionCollapsed) && (
            <ChatSidebarSessionList
              sessions={displaySessions}
              folders={folders}
              filter={filter}
              activeFolderId={activeFolderId || null}
              activeSessionId={activeSessionId}
              isCollapsed={isUnassignedSectionCollapsed}
              onToggleCollapse={() => setIsUnassignedSectionCollapsed(!isUnassignedSectionCollapsed)}
              onSessionSelect={onSessionSelect}
              onClose={onClose}
              onToggleFavorite={onToggleFavorite}
              onToggleTrash={onToggleTrash}
              onDeletePermanent={onDeletePermanent}
              onMoveToFolder={onMoveToFolder}
            />
          )}
        </div>
      </div>

      <ChatFolderDialogs
        newFolderDialog={newFolderDialog}
        setNewFolderDialog={setNewFolderDialog}
        editFolderDialog={editFolderDialog}
        setEditFolderDialog={setEditFolderDialog}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        folderColor={newFolderColor}
        setFolderColor={setNewFolderColor}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        FOLDER_COLORS={FOLDER_COLORS}
      />
    </>
  );
}
