import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Clock } from "lucide-react";

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
        <div className="bg-white border p-4 rounded-xl shadow-sm mb-6">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Textarea
                        placeholder={
                            isFlagged
                                ? "Topik ini telah diblokir..."
                                : "Tulis balasan Anda..."
                        }
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[44px] max-h-[120px] resize-none pr-12 py-3 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        style={{ height: "44px" }}
                        disabled={!!isFlagged}
                    />
                </div>
                <Button
                    className="h-[44px] w-[44px] p-0 shrink-0 rounded-xl"
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
