"use client";

import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
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
import { useBlockStore } from "@/store/blockStore";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface BlockUserButtonProps {
  userId: number;
  userName: string;
  className?: string;
  onSuccess?: () => void;
}

export function BlockUserButton({
  userId,
  userName,
  className,
  onSuccess,
}: BlockUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuthStore();
  const { blockUser, isBlocked } = useBlockStore();
  const userIsBlocked = isBlocked(userId);

  const handleBlock = async () => {
    if (!token) {
      toast.error("Silakan login untuk memblokir pengguna");
      return;
    }

    setSubmitting(true);
    try {
      await blockUser(token, userId);
      toast.success(`Berhasil memblokir ${userName}`);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Gagal memblokir pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className} disabled={userIsBlocked}>
          <Ban className="w-4 h-4 mr-2" />
          {userIsBlocked ? "Diblokir" : "Blokir"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Blokir Pengguna?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin memblokir <strong>{userName}</strong>? Anda tidak akan lagi melihat konten dari pengguna ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleBlock} disabled={submitting} variant="destructive">
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Blokir Pengguna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
