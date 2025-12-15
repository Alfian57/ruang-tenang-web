import { MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateSession: () => void;
}

/**
 * Empty state view shown when no chat session is selected.
 * Encourages users to start a new conversation.
 */
export function EmptyState({ onCreateSession }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 animate-pulse">
        <MessageCircle className="w-10 h-10 text-primary" />
      </div>
      
      <h3 className="font-bold text-xl mb-2 text-gray-800">
        Mulai Percakapan Baru
      </h3>
      
      <p className="text-gray-500 max-w-sm mb-2 leading-relaxed text-sm">
        Ceritakan apa yang sedang kamu rasakan. AI kami siap mendengarkan.
      </p>
      
      <div className="mb-6 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
        ✨ Dapatkan 10 EXP per respon AI (Maks 1x/hari)
      </div>
      
      <Button
        onClick={onCreateSession}
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-4 h-auto text-sm shadow-md hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Buat Obrolan Baru
      </Button>
    </div>
  );
}
