"use client";

import { useState } from "react";
import { UserX, Loader2, Ban } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlockedUsersModal({ isOpen, onClose }: BlockedUsersModalProps) {
  const { token } = useAuthStore();
  const { blockedUsers, isLoaded, unblockUser } = useBlockStore();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<{
    userId: number;
    userName: string;
  } | null>(null);

  const handleUnblock = async () => {
    if (!token || !confirmUnblock) return;
    setProcessingId(confirmUnblock.userId);
    try {
      await unblockUser(token, confirmUnblock.userId);
      toast.success("Pengguna berhasil dibuka blokirnya");
      setConfirmUnblock(null);
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Gagal membuka blokir");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pengguna Diblokir</DialogTitle>
            <DialogDescription>
              Daftar pengguna yang telah Anda blokir. Konten mereka tidak akan
              ditampilkan kepada Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
            {!isLoaded ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Memuat...</p>
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  Tidak ada pengguna diblokir
                </p>
              </div>
            ) : (
              blockedUsers.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                      {block.blocked_avatar ? (
                        <Image
                          src={block.blocked_avatar}
                          alt={block.blocked_name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <Ban className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {block.blocked_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Diblokir:{" "}
                        {new Date(block.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    disabled={processingId === block.blocked_id}
                    onClick={() =>
                      setConfirmUnblock({
                        userId: block.blocked_id,
                        userName: block.blocked_name,
                      })
                    }
                  >
                    {processingId === block.blocked_id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Buka Blokir"
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unblock Confirm Dialog */}
      <Dialog
        open={!!confirmUnblock}
        onOpenChange={(open) => !open && setConfirmUnblock(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Buka Blokir Pengguna?</DialogTitle>
            <DialogDescription>
              Konten dari{" "}
              <span className="font-semibold text-gray-900">
                {confirmUnblock?.userName}
              </span>{" "}
              akan ditampilkan kembali kepada Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmUnblock(null)}
              disabled={!!processingId}
            >
              Batal
            </Button>
            <Button onClick={handleUnblock} disabled={!!processingId}>
              {processingId ? "Membuka blokir..." : "Ya, Buka Blokir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
