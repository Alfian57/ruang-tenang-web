"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag, AlertCircle } from "lucide-react";
import { cn } from "@/utils";

export type ReportType = "article" | "forum" | "forum_post" | "user";
export type ReportReason =
    | "misinformation"
    | "harmful"
    | "harassment"
    | "spam"
    | "impersonation"
    | "other";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        report_type: ReportType;
        content_id?: number;
        user_id?: number;
        reason: ReportReason;
        description?: string;
    }) => Promise<void>;
    reportType: ReportType;
    contentId?: number;
    userId?: number;
    contentTitle?: string;
    userName?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
    {
        value: "misinformation",
        label: "Informasi Keliru",
        description: "Konten mengandung informasi yang tidak akurat atau menyesatkan",
    },
    {
        value: "harmful",
        label: "Konten Berbahaya",
        description: "Konten dapat membahayakan kesehatan mental atau fisik",
    },
    {
        value: "harassment",
        label: "Pelecehan",
        description: "Konten melecehkan, mengintimidasi, atau menyerang seseorang",
    },
    {
        value: "spam",
        label: "Spam",
        description: "Konten promosi, berulang, atau tidak relevan",
    },
    {
        value: "impersonation",
        label: "Penyamaran",
        description: "Seseorang berpura-pura menjadi orang lain",
    },
    {
        value: "other",
        label: "Lainnya",
        description: "Alasan lain yang tidak tercantum di atas",
    },
];

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    article: "Artikel",
    forum: "Forum",
    forum_post: "Postingan Forum",
    user: "Pengguna",
};

export function ReportModal({
    isOpen,
    onClose,
    onSubmit,
    reportType,
    contentId,
    userId,
    contentTitle,
    userName,
}: ReportModalProps) {
    const [selectedReason, setSelectedReason] = React.useState<ReportReason | null>(null);
    const [description, setDescription] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError("Silakan pilih alasan pelaporan");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onSubmit({
                report_type: reportType,
                content_id: contentId,
                user_id: userId,
                reason: selectedReason,
                description: description || undefined,
            });

            // Reset form on success
            setSelectedReason(null);
            setDescription("");
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengirim laporan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setSelectedReason(null);
            setDescription("");
            setError(null);
            onClose();
        }
    };

    const targetDescription = contentTitle
        ? `"${contentTitle}"`
        : userName
            ? `pengguna "${userName}"`
            : `${REPORT_TYPE_LABELS[reportType]} ini`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                            <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-xl">
                            Laporkan {REPORT_TYPE_LABELS[reportType]}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-left">
                        Anda akan melaporkan {targetDescription}. Pilih alasan pelaporan di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Reason Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Alasan Pelaporan *</Label>
                        <div className="space-y-2">
                            {REPORT_REASONS.map((reason) => (
                                <label
                                    key={reason.value}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                        selectedReason === reason.value
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:bg-muted/50"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="report-reason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={() => setSelectedReason(reason.value)}
                                        className="mt-0.5 accent-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{reason.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {reason.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Additional Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Deskripsi Tambahan (opsional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Berikan detail tambahan tentang pelaporan ini..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedReason}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? "Mengirim..." : "Kirim Laporan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
