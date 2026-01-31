"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { ReportReason, ReportType } from "@/types/moderation";

interface ReportModalProps {
  type: ReportType;
  contentId?: number | string;
  userId?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam atau Penipuan" },
  { value: "harassment", label: "Pelecehan atau Bullying" },
  { value: "harmful", label: "Konten Berbahaya atau Self-Harm" },
  { value: "misinformation", label: "Misinformasi Kesehatan" },
  { value: "impersonation", label: "Penyamaran Akun" },
  { value: "other", label: "Lainnya" },
];

export function ReportModal({
  type,
  contentId,
  userId,
  trigger,
  onSuccess,
}: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuthStore();

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Silakan login untuk melaporkan konten");
      return;
    }
    if (!reason) {
      toast.error("Pilih alasan pelaporan");
      return;
    }

    setSubmitting(true);
    try {
      await api.createReport(token, {
        report_type: type,
        content_id: contentId,
        user_id: userId,
        reason: reason as ReportReason,
        description: description.trim(),
      });
      toast.success("Laporan berhasil dikirim");
      setOpen(false);
      setReason("");
      setDescription("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("Gagal mengirim laporan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
            <Flag className="w-4 h-4 mr-2" />
            Laporkan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Laporkan Konten</DialogTitle>
          <DialogDescription>
            Bantu kami menjaga komunitas tetap aman dan nyaman.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Alasan Pelaporan</Label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as ReportReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Keterangan Tambahan (Opsional)</Label>
            <Textarea
              placeholder="Jelaskan detail pelanggaran..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason} variant="destructive">
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kirim Laporan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
