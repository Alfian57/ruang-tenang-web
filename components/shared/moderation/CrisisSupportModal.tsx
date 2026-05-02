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
      <DialogContent className="w-[calc(100%-2rem)] border-rose-100 bg-white p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="space-y-3 px-5 pt-5 text-left sm:px-6 sm:pt-6">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold leading-7 text-rose-700">
                Anda Tidak Sendirian
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6 text-gray-600">
                Kami mendeteksi Anda mungkin sedang mengalami masa sulit. Jika Anda merasa ingin menyakiti diri sendiri atau dalam bahaya, mohon segera cari bantuan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 sm:px-6">
          <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-950">Layanan Darurat (24 Jam)</h4>
            <div className="rounded-xl border border-rose-100 bg-white p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex min-w-0 items-start gap-2 text-sm font-semibold leading-5 text-rose-700">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>LISA (Layanan Pencegahan Bunuh Diri)</span>
                </span>
                <a
                  href="tel:119"
                  className="inline-flex w-fit items-center rounded-full bg-rose-100 px-3 py-1.5 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-200"
                >
                  119 / 119 ext 8
                </a>
              </div>
              <p className="mt-2 text-xs font-medium text-rose-600">Indonesia</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              Anda juga bisa menghubungi orang terdekat atau profesional kesehatan mental.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:justify-between sm:space-x-0 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full justify-center text-gray-600 hover:bg-white hover:text-gray-900 sm:w-auto"
          >
            Saya Mengerti, Lanjut Menulis
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (onContactSupport) {
                onContactSupport();
              } else {
                window.open("tel:119", "_self");
              }
            }}
            className="w-full justify-center gap-2 bg-red-600 hover:bg-red-700 sm:w-auto"
          >
            <Phone className="h-4 w-4" />
            Hubungi Bantuan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
