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
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tag Populer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {analytics.top_tags.map((item) => (
                        <span
                            key={item.tag}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                            #{item.tag}
                            <span className="ml-1 text-gray-500">({item.count})</span>
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
