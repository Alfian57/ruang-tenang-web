import { useState } from "react";
import { ChatFolder } from "@/types";

interface UseChatSidebarProps {
  onCreateFolder?: (name: string, color?: string) => void;
  onUpdateFolder?: (folderId: number, data: { name?: string; color?: string }) => void;
}

export function useChatSidebar({ onCreateFolder, onUpdateFolder }: UseChatSidebarProps) {
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [editFolderDialog, setEditFolderDialog] = useState<ChatFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isFolderSectionCollapsed, setIsFolderSectionCollapsed] = useState(false);
  const [isUnassignedSectionCollapsed, setIsUnassignedSectionCollapsed] = useState(false);

  // Constants
  const FOLDER_COLORS = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Emerald", value: "#10b981" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Purple", value: "#a855f7" },
  ];

  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim(), newFolderColor);
      resetFolderForm();
      setNewFolderDialog(false);
    }
  };

  const handleUpdateFolder = () => {
    if (editFolderDialog && newFolderName.trim() && onUpdateFolder) {
      onUpdateFolder(editFolderDialog.id, { name: newFolderName.trim(), color: newFolderColor });
      resetFolderForm();
      setEditFolderDialog(null);
    }
  };

  const resetFolderForm = () => {
    setNewFolderName("");
    setNewFolderColor("#6366f1");
  };

  const openEditFolder = (folder: ChatFolder) => {
    setEditFolderDialog(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
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

  return {
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
    resetFolderForm,
    FOLDER_COLORS
  };
}
