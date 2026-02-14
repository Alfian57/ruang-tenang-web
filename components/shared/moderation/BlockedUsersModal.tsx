"use client";

import { useState, useEffect, useCallback } from "react";
import { UserX, Loader2, Ban } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { moderationService } from "@/services/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { UserBlock } from "@/types/moderation";

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlockedUsersModal({ isOpen, onClose }: BlockedUsersModalProps) {
  const [blockedUsers, setBlockedUsers] = useState<UserBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await moderationService.getBlockedUsers(token) as unknown as { blocks: UserBlock[] };
      setBlockedUsers(response.blocks || []);
    } catch (error) {
      console.error("Failed to load blocked users:", error);
      toast.error("Gagal memuat daftar blokir");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      loadBlockedUsers();
    }
  }, [isOpen, loadBlockedUsers]);

  const handleUnblock = async (blockId: number, userId: number) => {
    if (!token) return;
    setProcessingId(blockId);
    try {
      await moderationService.unblockUser(token, userId);
      setBlockedUsers((prev) => prev.filter((b) => b.id !== blockId));
      toast.success("Pengguna berhasil di-unblock");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Gagal melakukan unblock");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pengguna Diblokir</DialogTitle>
          <DialogDescription>
            Daftar pengguna yang telah Anda blokir. Mereka tidak bisa berinteraksi dengan Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Memuat...</p>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
              <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Tidak ada pengguna diblokir</p>
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
                    <h4 className="font-semibold text-sm">{block.blocked_name}</h4>
                    <p className="text-xs text-gray-500">
                      Diblokir: {new Date(block.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  disabled={processingId === block.id}
                  onClick={() => handleUnblock(block.id, block.blocked_id)}
                >
                  {processingId === block.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
