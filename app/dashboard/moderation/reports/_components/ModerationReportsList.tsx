import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { UserReport } from "@/types/moderation";
import { ModerationReportItem } from "./ModerationReportItem";

interface ModerationReportsListProps {
    reports: UserReport[];
    isLoading: boolean;
    searchQuery: string;
    totalPages: number;
    page: number;
    setPage: (page: number) => void;
}

export function ModerationReportsList({
    reports,
    isLoading,
    searchQuery,
    totalPages,
    page,
    setPage,
}: ModerationReportsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Laporan ({reports.length})</CardTitle>
                <CardDescription>
                    Klik pada laporan untuk melihat detail dan mengambil tindakan
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
                                <div className="h-10 w-10 bg-muted rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-muted rounded w-1/2" />
                                    <div className="h-4 bg-muted rounded w-1/3" />
                                </div>
                                <div className="h-8 w-20 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Tidak ada laporan</h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? "Tidak ada laporan yang cocok dengan pencarian"
                                : "Tidak ada laporan yang menunggu penanganan"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <ModerationReportItem key={report.id} report={report} />
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
