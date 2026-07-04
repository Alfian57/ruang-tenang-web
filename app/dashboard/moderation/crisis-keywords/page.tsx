"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Plus, Trash2, ArrowLeft, ShieldAlert } from "lucide-react";
import { useCrisisKeywords } from "./_hooks/useCrisisKeywords";
import type { CrisisCategory, CrisisSeverity, CreateCrisisKeywordRequest } from "@/types/moderation";

const CATEGORY_LABELS: Record<CrisisCategory, string> = {
  self_harm: "Melukai Diri",
  suicide: "Bunuh Diri",
  severe_depression: "Depresi Berat",
  emergency: "Darurat",
};

const SEVERITY_BADGE: Record<CrisisSeverity, { label: string; variant: "warning" | "destructive" | "info" }> = {
  medium: { label: "Sedang", variant: "warning" },
  high: { label: "Tinggi", variant: "destructive" },
  critical: { label: "Kritis", variant: "destructive" },
};

export default function CrisisKeywordsPage() {
  const { keywords, isLoading, isSaving, deletingId, createKeyword, deleteKeyword } = useCrisisKeywords();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateCrisisKeywordRequest>({
    keyword: "",
    category: "self_harm",
    severity: "medium",
    language: "id",
    notes: "",
  });

  const openCreate = () => {
    setForm({ keyword: "", category: "self_harm", severity: "medium", language: "id", notes: "" });
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.keyword.trim()) return;
    try {
      await createKeyword({
        ...form,
        keyword: form.keyword.trim(),
        language: form.language?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
      setDialogOpen(false);
    } catch {
      /* logged in hook */
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteKeyword(deleteId);
      setDeleteId(null);
    } catch {
      /* logged in hook */
    }
  };

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
            <h1 className="text-2xl font-bold">Kata Kunci Krisis</h1>
            <p className="text-muted-foreground">
              Kelola kata kunci deteksi krisis (self-harm, bunuh diri, darurat)
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="gradient-primary w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Tambah Kata Kunci
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kata Kunci ({keywords.length})</CardTitle>
          <CardDescription>
            Kata kunci ini dipakai untuk mendeteksi konten yang mengindikasikan krisis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-14 bg-muted rounded-lg" />
              ))}
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-16">
              <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada kata kunci</h3>
              <p className="text-gray-400 text-sm mt-1">Tambahkan kata kunci untuk deteksi krisis.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {keywords.map((kw) => {
                const sev = SEVERITY_BADGE[kw.severity];
                return (
                  <div key={kw.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{kw.keyword}</span>
                        <Badge variant="muted">{CATEGORY_LABELS[kw.category]}</Badge>
                        {sev && <Badge variant={sev.variant}>{sev.label}</Badge>}
                        {kw.language && <Badge variant="outline">{kw.language}</Badge>}
                        {!kw.is_active && <Badge variant="outline">Nonaktif</Badge>}
                      </div>
                      {kw.notes && <p className="text-xs text-muted-foreground mt-1">{kw.notes}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(kw.id)}
                      disabled={deletingId === kw.id}
                      aria-label="Hapus kata kunci"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kata Kunci Krisis</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              label="Kata Kunci"
              value={form.keyword}
              onChange={(e) => setForm((p) => ({ ...p, keyword: e.target.value }))}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v as CrisisCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self_harm">Melukai Diri</SelectItem>
                  <SelectItem value="suicide">Bunuh Diri</SelectItem>
                  <SelectItem value="severe_depression">Depresi Berat</SelectItem>
                  <SelectItem value="emergency">Darurat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tingkat Keparahan</label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm((p) => ({ ...p, severity: v as CrisisSeverity }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="critical">Kritis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Bahasa"
              value={form.language}
              onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
              placeholder="id"
            />
            <Input
              label="Catatan (opsional)"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={isSaving || !form.keyword.trim()}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Kata Kunci"
        description="Yakin ingin menghapus kata kunci krisis ini?"
        isLoading={deletingId !== null}
      />
    </div>
  );
}
