import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { ModerationQueueItem as ModerationQueueItemType } from "@/types/moderation";
import { ModerationQueueItem } from "./ModerationQueueItem";

interface ModerationQueueListProps {
    items: ModerationQueueItemType[];
    isLoading: boolean;
    searchQuery: string;
    totalPages: number;
    page: number;
    setPage: (page: number) => void;
}

export function ModerationQueueList({
    items,
    isLoading,
    searchQuery,
    totalPages,
    page,
    setPage,
}: ModerationQueueListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Artikel ({items.length})</CardTitle>
                <CardDescription>
                    Klik pada artikel untuk melihat detail dan melakukan moderasi
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse flex items-center gap-4 p-4 border rounded-lg"
                            >
                                <div className="h-12 w-12 bg-muted rounded" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-muted rounded w-1/2" />
                                    <div className="h-4 bg-muted rounded w-1/3" />
                                </div>
                                <div className="h-8 w-20 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Tidak ada artikel</h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? "Tidak ada artikel yang cocok dengan pencarian"
                                : "Tidak ada artikel yang menunggu moderasi"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <ModerationQueueItem key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1 || isLoading}
                        >
                            Sebelumnya
                        </Button>
                        <span className="flex items-center px-4 text-sm text-muted-foreground">
                            Halaman {page} dari {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || isLoading}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
