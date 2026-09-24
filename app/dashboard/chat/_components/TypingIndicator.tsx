import { RuNaAvatar } from "./RuNaAvatar";

interface TypingIndicatorProps {
  isRecording?: boolean;
}

/**
 * Displays an animated typing indicator when AI is generating a response.
 */
export function TypingIndicator({ isRecording = false }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3">
      <RuNaAvatar />
      
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-rose-100 bg-[#fff9f7] px-5 py-4">
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
