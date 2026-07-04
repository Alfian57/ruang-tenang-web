"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, ArrowLeft, Gavel } from "lucide-react";
import { formatDate } from "@/utils";
import type { AppealStatus } from "@/types/moderation";
import { useModerationAppeals } from "./_hooks/useModerationAppeals";

const STATUS_BADGE: Record<AppealStatus, { label: string; variant: "warning" | "success" | "destructive" }> = {
  pending: { label: "Menunggu", variant: "warning" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

export default function ModerationAppealsPage() {
  const {
    appeals,
    isLoading,
    statusFilter,
    page,
    totalPages,
    processingId,
    setStatusFilter,
    setPage,
    loadAppeals,
    review,
  } = useModerationAppeals();

  const [notesMap, setNotesMap] = useState<Record<number, string>>({});

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    const notes = notesMap[id]?.trim() || undefined;
    try {
      await review(id, status, notes);
      setNotesMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      // error already logged in hook
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={ROUTES.ADMIN.MODERATION} aria-label="Kembali ke dashboard moderasi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Banding Pengguna</h1>
            <p className="text-muted-foreground">Tinjau banding atas suspensi atau pemblokiran</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAppeals} disabled={isLoading}>
            Muat Ulang
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banding ({appeals.length})</CardTitle>
          <CardDescription>
            Setujui untuk mencabut pembatasan, atau tolak dengan menyertakan alasan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-3 p-4 border rounded-lg">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : appeals.length === 0 ? (
            <div className="text-center py-16">
              <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Tidak ada banding</h3>
              <p className="text-gray-400 text-sm mt-1">
                Tidak ada banding dengan status ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => {
                const isProcessing = processingId === appeal.id;
                const badge = STATUS_BADGE[appeal.status];
                return (
                  <div key={appeal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">
                            {appeal.user_name || appeal.user_email || `Pengguna #${appeal.user_id}`}
                          </h3>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(appeal.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground">Alasan banding:</p>
                      <p className="whitespace-pre-wrap">{appeal.reason}</p>
                    </div>

                    {appeal.evidence && (
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground">Bukti:</p>
                        <p className="whitespace-pre-wrap break-words">{appeal.evidence}</p>
                      </div>
                    )}

                    {appeal.status !== "pending" && appeal.reviewer_notes && (
                      <div className="text-sm bg-muted/50 rounded-md p-3">
                        <p className="font-medium text-muted-foreground">
                          Catatan peninjau{appeal.reviewer_name ? ` (${appeal.reviewer_name})` : ""}:
                        </p>
                        <p className="whitespace-pre-wrap">{appeal.reviewer_notes}</p>
                      </div>
                    )}

                    {appeal.status === "pending" && (
                      <>
                        <Textarea
                          placeholder="Catatan peninjauan (opsional)"
                          value={notesMap[appeal.id] || ""}
                          onChange={(e) =>
                            setNotesMap((prev) => ({ ...prev, [appeal.id]: e.target.value }))
                          }
                          rows={2}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(appeal.id, "approved")}
                            disabled={isProcessing}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Setujui Banding
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReview(appeal.id, "rejected")}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Tolak Banding
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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
    </div>
  );
}
