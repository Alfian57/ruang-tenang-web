import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Eye, Flag, Clock } from "lucide-react";
import { formatDate } from "@/utils";
import { UserReport, ReportReason } from "@/types/moderation";
import { STATUS_CONFIG, TYPE_CONFIG } from "./ModerationReportsHeader";

const REASON_LABELS: Record<ReportReason, string> = {
    misinformation: "Informasi Keliru",
    harmful: "Konten Berbahaya",
    harassment: "Pelecehan",
    spam: "Spam",
    impersonation: "Penyamaran",
    other: "Lainnya",
};

interface ModerationReportItemProps {
    report: UserReport;
}

export function ModerationReportItem({ report }: ModerationReportItemProps) {
    const TypeIcon = TYPE_CONFIG[report.report_type]?.icon || Flag;
    const StatusIcon = STATUS_CONFIG[report.status]?.icon || Clock;

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <TypeIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                        {report.content_title ||
                            report.reported_user_name ||
                            `Laporan #${report.id}`}
                    </h3>
                    <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                            STATUS_CONFIG[report.status]?.color
                        }`}
                    >
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {STATUS_CONFIG[report.status]?.label}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <TypeIcon className="h-3 w-3" />
                        {TYPE_CONFIG[report.report_type]?.label}
                    </span>
                    {" • "}
                    <span>{REASON_LABELS[report.reason]}</span>
                    {" • "}
                    <span>Dilaporkan oleh {report.reporter_name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(report.created_at)}
                </p>
            </div>

            <Button asChild size="sm">
                <Link href={ROUTES.moderationReport(report.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Tinjau
                </Link>
            </Button>
        </div>
    );
}
