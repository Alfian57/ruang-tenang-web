import Image from "next/image";
import { cn } from "@/utils";
import { FilterType } from "./types";

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
    <div className="p-4 space-y-1 border-b">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => {
            onFilterChange(opt.key);
            onClearActiveFolder?.();
          }}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
            filter === opt.key && !activeFolderId
              ? "bg-red-50 text-primary"
              : "hover:bg-gray-50 text-gray-600"
          )}
        >
          <div className="flex items-center gap-3">
            <Image src={opt.icon} alt={opt.label} width={16} height={16} />
            <span>{opt.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
