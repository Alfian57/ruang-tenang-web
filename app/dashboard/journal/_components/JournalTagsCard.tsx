import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { JournalAnalytics } from "@/types";

interface JournalTagsCardProps {
    analytics: JournalAnalytics;
}

export function JournalTagsCard({ analytics }: JournalTagsCardProps) {
    if (!analytics.top_tags || analytics.top_tags.length === 0) {
        return null;
    }

    return (
        <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                        <Tag className="h-5 w-5" />
                    </span>
                    <div>
                        <CardTitle className="text-base text-slate-900">Tema yang sering kamu tulis</CardTitle>
                        <p className="mt-1 text-xs text-slate-500">Tag yang paling banyak muncul di catatanmu</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {analytics.top_tags.map((item) => (
                        <span
                            key={item.tag}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-theme-accent-border hover:bg-theme-accent-soft"
                        >
                            <span className="font-medium">#{item.tag}</span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{item.count}</span>
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
