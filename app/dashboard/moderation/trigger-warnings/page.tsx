"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { TriggerWarningCategory } from "@/types/moderation";

const TRIGGER_WARNING_OPTIONS: { value: TriggerWarningCategory; label: string }[] = [
  { value: "self_harm", label: "Melukai Diri" },
  { value: "suicide", label: "Bunuh Diri" },
  { value: "depression", label: "Depresi" },
  { value: "anxiety", label: "Kecemasan" },
  { value: "abuse", label: "Kekerasan/Pelecehan" },
  { value: "violence", label: "Kekerasan" },
  { value: "eating_disorder", label: "Gangguan Makan" },
  { value: "substance_abuse", label: "Penyalahgunaan Zat" },
  { value: "trauma", label: "Trauma" },
  { value: "death", label: "Kematian" },
  { value: "other", label: "Lainnya" },
];

export default function TriggerWarningsPage() {
  const { token } = useAuthStore();

  const [contentType, setContentType] = useState<"article" | "forum">("article");
  const [contentId, setContentId] = useState("");
  const [selected, setSelected] = useState<TriggerWarningCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (value: TriggerWarningCategory) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!token) return;
    const id = Number(contentId);
    if (!Number.isFinite(id) || id < 1) {
      toast.error("ID konten tidak valid.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Pilih minimal satu trigger warning.");
      return;
    }
    setIsSaving(true);
    try {
      await moderationService.addTriggerWarnings(token, {
        content_type: contentType,
        content_id: id,
        trigger_warnings: selected,
      });
      toast.success("Trigger warning berhasil ditambahkan.");
      setContentId("");
      setSelected([]);
    } catch (error) {
      console.error("Failed to add trigger warnings:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan trigger warning.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href={ROUTES.ADMIN.MODERATION} aria-label="Kembali ke dashboard moderasi">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Trigger Warning</h1>
          <p className="text-muted-foreground">
            Tambahkan penanda konten sensitif pada artikel atau forum
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Tambah Trigger Warning
          </CardTitle>
          <CardDescription>
            Pilih jenis konten, masukkan ID konten, lalu tandai kategori peringatan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Jenis Konten</label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as "article" | "forum")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Artikel</SelectItem>
                  <SelectItem value="forum">Forum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="ID Konten"
              type="number"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              placeholder="mis. 123"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori Trigger Warning</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRIGGER_WARNING_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSaving || !contentId || selected.length === 0}>
            {isSaving ? "Menyimpan..." : "Tambahkan Trigger Warning"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
