import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2, Flag, Eye } from "lucide-react";
import { UserReport } from "@/types/moderation";

interface ModerationRecentReportsProps {
    reports: UserReport[];
    isLoading: boolean;
}

export function ModerationRecentReports({ reports, isLoading }: ModerationRecentReportsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Laporan Terbaru</CardTitle>
                    <CardDescription>Laporan pengguna yang perlu ditangani</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href={ROUTES.ADMIN.MODERATION_REPORTS}>
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
                ) : reports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Tidak ada laporan yang menunggu</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="shrink-0">
                                    <Flag className="h-5 w-5 text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {report.content_title || `Laporan ${report.report_type}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Dilaporkan oleh {report.reporter_name} • {report.reason}
                                    </p>
                                </div>
                                <Button asChild size="sm" variant="ghost">
                                    <Link href={ROUTES.moderationReport(report.id)}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
