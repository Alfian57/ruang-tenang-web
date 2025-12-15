import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  isRecording?: boolean;
}

/**
 * Displays an animated typing indicator when AI is generating a response.
 */
export function TypingIndicator({ isRecording = false }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback className="bg-transparent">
          <Image src="/images/ai-profile.png" alt="AI" width={40} height={40} />
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium animate-pulse">
          {isRecording ? "Mengirim suara..." : "Sedang mengetik..."}
        </span>
        
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
