import { Heart, History, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/utils";
import { FilterType } from "./types";

interface FilterOption {
  key: FilterType;
  icon: LucideIcon;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", icon: History, label: "Riwayat" },
  { key: "favorites", icon: Heart, label: "Favorit" },
  { key: "trash", icon: Trash2, label: "Sampah" },
];

interface ChatSidebarFilterProps {
  filter: FilterType;
  activeFolderId?: number | null;
  onFilterChange: (filter: FilterType) => void;
  onClearActiveFolder?: () => void;
}

export function ChatSidebarFilter({
  filter,
  activeFolderId,
  onFilterChange,
  onClearActiveFolder
}: ChatSidebarFilterProps) {
  return (
    <div className="space-y-1 border-b border-rose-100 px-3 py-3">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            onFilterChange(opt.key);
            onClearActiveFolder?.();
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
            filter === opt.key && !activeFolderId
              ? "bg-rose-50 font-semibold text-rose-700"
              : "text-slate-600 hover:bg-white hover:text-rose-700"
          )}
        >
          <div className="flex items-center gap-3">
            <opt.icon className="h-4 w-4" aria-hidden="true" />
            <span>{opt.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
