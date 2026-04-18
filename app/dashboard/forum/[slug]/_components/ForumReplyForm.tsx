import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Clock } from "lucide-react";

const SAFE_RESPONSE_STARTERS = [
    "Terima kasih sudah cerita. Perasaan kamu valid, dan kamu tidak sendirian.",
    "Aku pernah merasakan hal mirip, yang membantuku waktu itu adalah langkah kecil ini.",
    "Kalau kamu berkenan, kita bisa pecah masalah ini jadi langkah paling ringan dulu.",
] as const;

interface ForumReplyFormProps {
    replyContent: string;
    setReplyContent: (content: string) => void;
    handleReply: () => void;
    submitting: boolean;
    isFlagged?: boolean;
}

export function ForumReplyForm({
    replyContent,
    setReplyContent,
    handleReply,
    submitting,
    isFlagged,
}: ForumReplyFormProps) {
    return (
        <div className="bg-white border p-3 sm:p-4 rounded-xl shadow-sm mb-6">
            {!isFlagged && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Safe response starter</p>
                    <div className="flex flex-wrap gap-2">
                        {SAFE_RESPONSE_STARTERS.map((starter) => (
                            <button
                                key={starter}
                                type="button"
                                className="text-left rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
                                onClick={() => setReplyContent(starter)}
                            >
                                {starter}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-end gap-2 sm:gap-3">
                <div className="flex-1 relative">
                    <Textarea
                        placeholder={
                            isFlagged
                                ? "Topik ini telah diblokir..."
                                : "Tulis balasan Anda..."
                        }
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-13 max-h-35 resize-y pr-3 py-3 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        disabled={!!isFlagged}
                    />
                </div>
                <Button
                    className="h-11 w-11 p-0 shrink-0 rounded-xl"
                    disabled={
                        !replyContent.trim() || submitting || !!isFlagged
                    }
                    onClick={handleReply}
                >
                    {submitting ? (
                        <Clock className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </Button>
            </div>
        </div>
    );
}
