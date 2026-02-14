"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HeartHandshake, Phone } from "lucide-react";

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSupport?: () => void;
}

export function CrisisSupportModal({
  isOpen,
  onClose,
  onContactSupport,
}: CrisisSupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-rose-200 bg-rose-50/50">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <HeartHandshake className="w-6 h-6" />
            <DialogTitle>Anda Tidak Sendirian</DialogTitle>
          </div>
          <DialogDescription className="text-gray-700">
            Kami mendeteksi Anda mungkin sedang mengalami masa sulit. Jika Anda merasa ingin menyakiti diri sendiri atau dalam bahaya, mohon segera cari bantuan.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-sm space-y-3">
          <h4 className="font-semibold text-gray-900">Layanan Darurat (24 Jam)</h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 bg-rose-50 rounded text-rose-700">
              <span className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                LISA (Layanan Pencegahan Bunuh Diri)
              </span>
              <span className="font-bold">119 / 119 ext 8 (Indonesia)</span>
            </div>
            <p className="text-xs text-gray-500">
              Anda juga bisa menghubungi orang terdekat atau profesional kesehatan mental.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Saya Menagerti, Lanjut Menulis
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (onContactSupport) {
                onContactSupport();
              } else {
                window.open("tel:119", "_self");
              }
            }}
            className="gap-2"
          >
            <Phone className="w-4 h-4" />
            Hubungi Bantuan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
