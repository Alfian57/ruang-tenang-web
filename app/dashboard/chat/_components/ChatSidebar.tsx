"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, MoreVertical, Trash2, X, Folder, FolderPlus, ChevronRight, ChevronDown, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChatSession, ChatFolder } from "@/types";
import { cn } from "@/lib/utils";
import { SessionItem } from "./SessionItem";

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

const FOLDER_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Purple", value: "#a855f7" },
];

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  filter: FilterType;
  folders?: ChatFolder[];
  activeFolderId?: number | null;
  onFilterChange: (filter: FilterType) => void;
  onSessionSelect: (sessionId: number) => void;
  onCreateSession: () => void;
  onToggleFavorite: (e: React.MouseEvent, sessionId: number) => void;
  onToggleTrash: (e: React.MouseEvent, sessionId: number) => void;
  onDeletePermanent?: (e: React.MouseEvent, sessionId: number) => void;
  // Folder actions
  onCreateFolder?: (name: string, color?: string) => void;
  onUpdateFolder?: (folderId: number, data: { name?: string; color?: string }) => void;
  onDeleteFolder?: (folderId: number) => void;
  onMoveToFolder?: (sessionId: number, folderId: number | null) => void;
  onFolderSelect?: (folderId: number | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar component displaying chat session list with filtering options.
 */
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
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [editFolderDialog, setEditFolderDialog] = useState<ChatFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isFolderSectionCollapsed, setIsFolderSectionCollapsed] = useState(false);
  const [isUnassignedSectionCollapsed, setIsUnassignedSectionCollapsed] = useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName("");
      setNewFolderColor("#6366f1");
      setNewFolderDialog(false);
    }
  };

  const handleUpdateFolder = () => {
    if (editFolderDialog && newFolderName.trim() && onUpdateFolder) {
      onUpdateFolder(editFolderDialog.id, { name: newFolderName.trim(), color: newFolderColor });
      setNewFolderName("");
      setNewFolderColor("#6366f1");
      setEditFolderDialog(null);
    }
  };

  const toggleFolderExpand = (folderId: number) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Group sessions by folder
  const sessionsByFolder = sessions.reduce((acc, session) => {
    const folderId = session.folder_id ?? 'unassigned';
    if (!acc[folderId]) acc[folderId] = [];
    acc[folderId].push(session);
    return acc;
  }, {} as Record<string | number, ChatSession[]>);

  const unassignedSessions = sessionsByFolder['unassigned'] || [];

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
        {/* Header */}
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Riwayat Chat</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                {sessions.length}
              </span>
              <button
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm hover:shadow-md transition-all h-9 text-xs"
              onClick={() => {
                onCreateSession();
                if (onClose) onClose();
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Chat Baru
            </Button>
            {onCreateFolder && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3"
                onClick={() => setNewFolderDialog(true)}
                title="Buat Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="p-4 space-y-1 border-b">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onFilterChange(opt.key);
                onFolderSelect?.(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                filter === opt.key && !activeFolderId
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

        {/* Folders section */}
        {folders.length > 0 && filter === "all" && (
          <div className="px-4 py-2 border-b">
            <button
              onClick={() => setIsFolderSectionCollapsed(!isFolderSectionCollapsed)}
              className="w-full flex items-center justify-between text-xs font-medium text-gray-500 mb-2 px-1 hover:text-gray-700 transition-colors"
            >
              <span>Folder</span>
              {isFolderSectionCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {!isFolderSectionCollapsed && (
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
                        onClick={() => toggleFolderExpand(folder.id)}
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
                        onClick={() => onFolderSelect?.(folder.id)}
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
                          <DropdownMenuItem onClick={() => {
                            setEditFolderDialog(folder);
                            setNewFolderName(folder.name);
                            setNewFolderColor(folder.color);
                          }}>
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
                            isActive={activeSessionId === session.id}
                            isTrashView={false}
                            folders={folders}
                            onSelect={() => {
                              onSessionSelect(session.id);
                              if (onClose) onClose();
                            }}
                            onToggleFavorite={onToggleFavorite}
                            onToggleTrash={onToggleTrash}
                            onMoveToFolder={onMoveToFolder}
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
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {/* Section title for unassigned chats */}
          {folders.length > 0 && filter === "all" && !activeFolderId && (
            <button
              onClick={() => setIsUnassignedSectionCollapsed(!isUnassignedSectionCollapsed)}
              className="w-full flex items-center justify-between text-xs font-medium text-gray-500 mb-3 px-1 hover:text-gray-700 transition-colors"
            >
              <span>Chat Lainnya</span>
              {isUnassignedSectionCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          
          {/* Hide content if collapsed */}
          {!(folders.length > 0 && filter === "all" && !activeFolderId && isUnassignedSectionCollapsed) && (
            <div className="space-y-2">
              {/* Show filtered sessions based on active folder or filter */}
              {(() => {
                let displaySessions = sessions;

                if (activeFolderId) {
                  displaySessions = sessionsByFolder[activeFolderId] || [];
                } else if (filter === "all") {
                  // Show only unassigned sessions when viewing "all" with folders
                  displaySessions = folders.length > 0 ? unassignedSessions : sessions;
                }

                return displaySessions.length > 0 ? (
                  displaySessions.map((session) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">
                      {activeFolderId ? "Folder kosong" : "Belum ada percakapan"}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Folder Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nama folder"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Warna</label>
              <div className="flex gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newFolderColor === color.value
                        ? "border-gray-800 scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewFolderColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewFolderDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Buat Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={!!editFolderDialog} onOpenChange={(open) => !open && setEditFolderDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nama folder"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder()}
            />
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Warna</label>
              <div className="flex gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newFolderColor === color.value
                        ? "border-gray-800 scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewFolderColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditFolderDialog(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateFolder} disabled={!newFolderName.trim()}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
