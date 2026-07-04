"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ScrollText } from "lucide-react";
import { formatDateTime } from "@/utils";
import type { ModeratorActionType } from "@/types/moderation";
import { useModeratorActions } from "./_hooks/useModeratorActions";

const ACTION_LABELS: Record<string, string> = {
  article_approved: "Artikel Disetujui",
  article_rejected: "Artikel Ditolak",
  article_request_edit: "Artikel Minta Revisi",
  content_removed: "Konten Dihapus",
  user_warned: "Pengguna Diperingatkan",
  user_suspended: "Pengguna Disuspensi",
  user_banned: "Pengguna Diblokir",
  user_unbanned: "Blokir Dicabut",
  strike_issued: "Strike Diberikan",
  strike_removed: "Strike Dicabut",
  report_dismissed: "Laporan Ditolak",
  report_resolved: "Laporan Diselesaikan",
  trigger_warning_added: "Trigger Warning Ditambahkan",
};

const ACTION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Aksi" },
  ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

const TARGET_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua Target" },
  { value: "article", label: "Artikel" },
  { value: "story", label: "Kisah" },
  { value: "forum_post", label: "Postingan Forum" },
  { value: "user", label: "Pengguna" },
  { value: "report", label: "Laporan" },
];

function actionVariant(actionType: string): "success" | "destructive" | "warning" | "info" | "muted" {
  if (actionType.includes("approved") || actionType.includes("resolved") || actionType.includes("unbanned")) return "success";
  if (actionType.includes("rejected") || actionType.includes("banned") || actionType.includes("removed") || actionType.includes("suspended")) return "destructive";
  if (actionType.includes("warned") || actionType.includes("strike") || actionType.includes("request_edit")) return "warning";
  return "info";
}

export default function ModeratorActionsPage() {
  const {
    actions,
    isLoading,
    totalPages,
    page,
    actionType,
    targetType,
    setActionType,
    setTargetType,
    setPage,
    loadActions,
  } = useModeratorActions();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={ROUTES.ADMIN.MODERATION} aria-label="Kembali ke dashboard moderasi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Log Aksi Moderator</h1>
            <p className="text-muted-foreground">Riwayat tindakan moderasi (audit trail)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Jenis Aksi" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Target" />
            </SelectTrigger>
            <SelectContent>
              {TARGET_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadActions} disabled={isLoading}>Muat Ulang</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aksi ({actions.length})</CardTitle>
          <CardDescription>Catatan setiap tindakan yang diambil moderator.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
              ))}
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-16">
              <ScrollText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada aksi</h3>
              <p className="text-gray-400 text-sm mt-1">Tidak ada aksi moderator untuk filter ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionVariant(action.action_type)}>
                        {ACTION_LABELS[action.action_type as ModeratorActionType] || action.action_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {action.target_type} #{action.target_id}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Oleh <span className="font-medium">{action.moderator_name}</span>
                    </p>
                    {action.reason && (
                      <p className="text-xs text-muted-foreground mt-1">Alasan: {action.reason}</p>
                    )}
                    {action.notes && (
                      <p className="text-xs text-muted-foreground">Catatan: {action.notes}</p>
                    )}
                    {(action.previous_state || action.new_state) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.previous_state || "-"} → {action.new_state || "-"}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(action.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1 || isLoading}>
                Sebelumnya
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages || isLoading}>
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
