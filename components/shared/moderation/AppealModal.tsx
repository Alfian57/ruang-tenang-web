"use client";

import { useState } from "react";
import { Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { moderationService } from "@/services/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppealModal({ isOpen, onClose }: AppealModalProps) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuthStore();

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Silakan login untuk mengajukan banding");
      return;
    }
    if (reason.trim().length < 10) {
      toast.error("Alasan banding minimal 10 karakter");
      return;
    }

    setSubmitting(true);
    try {
      await moderationService.submitAppeal(token, {
        reason: reason.trim(),
        evidence: evidence.trim() || undefined,
      });
      toast.success("Permohonan banding berhasil dikirim");
      onClose();
      setReason("");
      setEvidence("");
    } catch (error: unknown) {
      // Safe error handling without using 'any'
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errMsg = err?.response?.data?.error || err?.message || "Gagal mengajukan banding";
      
      if (errMsg.includes("already have a pending appeal")) {
        toast.error("Anda sudah memiliki permohonan banding yang sedang diproses");
      } else {
        toast.error(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-100">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle>Ajukan Banding</DialogTitle>
          </div>
          <DialogDescription>
            Jelaskan mengapa sanksi terhadap akun Anda perlu ditinjau ulang. Sertakan bukti pendukung jika ada.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Alasan Banding <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Jelaskan alasan Anda mengapa sanksi ini tidak tepat..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500">{reason.length}/500 karakter (minimal 10)</p>
          </div>

          <div className="space-y-2">
            <Label>Bukti Pendukung (Opsional)</Label>
            <Textarea
              placeholder="Tautan, tangkapan layar, atau deskripsi bukti pendukung..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || reason.trim().length < 10}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kirim Banding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
