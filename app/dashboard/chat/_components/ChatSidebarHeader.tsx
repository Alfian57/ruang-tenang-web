import { Plus, X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSidebarHeaderProps {
  sessionCount: number;
  onClose?: () => void;
  onCreateSession: () => void;
  onCreateFolder?: () => void;
}

export function ChatSidebarHeader({
  sessionCount,
  onClose,
  onCreateSession,
  onCreateFolder
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-4 border-b sticky top-0 bg-white z-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Riwayat Chat</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
            {sessionCount}
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
            onClick={onCreateFolder}
            title="Buat Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
