import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";

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
        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_14px_36px_-30px_rgba(15,23,42,0.45)] sm:p-5" aria-label="Tulis balasan">
            <div className="mb-3 flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/8 text-primary">
                    <MessageCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900">{isFlagged ? "Balasan dinonaktifkan" : "Tulis balasan"}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {isFlagged ? "Topik ini sedang dibatasi oleh moderator." : "Bagikan tanggapan yang suportif dan tetap jaga privasi."}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <Textarea
                    aria-label="Isi balasan"
                    placeholder={isFlagged ? "Balasan tidak tersedia untuk topik ini." : "Tulis tanggapanmu di sini…"}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-28 resize-y rounded-2xl border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm leading-relaxed placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-primary/15"
                    disabled={!!isFlagged || submitting}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-400">Jaga percakapan tetap hangat dan saling menghargai.</p>
                    <Button
                        className="h-10 shrink-0 gap-2 rounded-xl px-4 shadow-sm transition hover:-translate-y-0.5"
                        disabled={!replyContent.trim() || submitting || !!isFlagged}
                        onClick={handleReply}
                    >
                        {submitting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span>{submitting ? "Mengirim…" : "Kirim balasan"}</span>
                    </Button>
                </div>
            </div>
        </section>
    );
}
