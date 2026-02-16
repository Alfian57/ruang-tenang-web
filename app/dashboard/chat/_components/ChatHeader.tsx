import { ChatSession } from "@/types";
import { Button } from "@/components/ui/button";
import {
    History,
    Download,
    FileText,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Pin,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
    activeSession: ChatSession;
    messageCount: number;
    pinnedCount: number;
    showSummary: boolean;
    onToggleSummary: () => void;
    onExport?: (format: "pdf" | "txt") => void;
    onOpenMobileSidebar?: () => void;
}

export function ChatHeader({
    activeSession,
    messageCount,
    pinnedCount,
    showSummary,
    onToggleSummary,
    onExport,
    onOpenMobileSidebar,
}: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
            <h3 className="font-semibold text-gray-800 line-clamp-1 flex-1">{activeSession.title}</h3>

            <div className="flex items-center gap-2">
                {/* Summary Button */}
                {messageCount >= 4 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleSummary}
                        className="text-gray-600 hover:text-primary"
                    >
                        <Sparkles className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Ringkasan</span>
                        {showSummary ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </Button>
                )}

                {/* Pinned Messages Indicator */}
                {pinnedCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:text-amber-700"
                        onClick={() => {
                            // Scroll to first pinned message
                            const firstPinned = document.querySelector('[data-pinned="true"]');
                            firstPinned?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                    >
                        <Pin className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">{pinnedCount}</span>
                    </Button>
                )}

                {/* Export Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
                            <Download className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onExport?.("pdf")}>
                            <FileText className="w-4 h-4 mr-2" />
                            Export sebagai PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onExport?.("txt")}>
                            <FileText className="w-4 h-4 mr-2" />
                            Export sebagai TXT
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile sidebar toggle */}
                <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar} className="lg:hidden">
                    <History className="w-5 h-5 text-gray-600" />
                </Button>
            </div>
        </div>
    );
}
