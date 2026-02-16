import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2, FileText, Eye } from "lucide-react";
import { ModerationQueueItem } from "@/types/moderation";

interface ModerationPendingArticlesProps {
    articles: ModerationQueueItem[];
    isLoading: boolean;
}

export function ModerationPendingArticles({ articles, isLoading }: ModerationPendingArticlesProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Artikel Menunggu Moderasi</CardTitle>
                    <CardDescription>Artikel terbaru yang perlu ditinjau</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href={ROUTES.ADMIN.MODERATION_QUEUE}>
                        Lihat Semua
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse flex items-center gap-3 p-3 bg-muted rounded-lg"
                            >
                                <div className="h-10 w-10 bg-muted-foreground/20 rounded" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Tidak ada artikel yang menunggu moderasi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="shrink-0">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{article.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        oleh {article.author_name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {article.moderation_status === "flagged" && (
                                        <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded">
                                            Ditandai
                                        </span>
                                    )}
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href={ROUTES.moderationArticle(article.id)}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
