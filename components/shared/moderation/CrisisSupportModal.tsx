"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils";
import { HeartHandshake, Phone, ShieldCheck } from "lucide-react";

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
  const { themeKey, isDefault } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          // The dialog portals to <body>, outside the themed dashboard wrapper,
          // so re-apply the active theme class here to inherit its color tokens.
          !isDefault && `theme-${themeKey}`,
          "w-[calc(100%-2rem)] gap-0 overflow-hidden border-none bg-white p-0 shadow-2xl sm:max-w-md"
        )}
      >
        {/* Accent header band */}
        <div className="gradient-primary px-6 py-5">
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold leading-tight text-white">
              Anda Tidak Sendirian
            </DialogTitle>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <DialogDescription className="text-sm leading-6 text-gray-600">
            Kami mendeteksi Anda mungkin sedang mengalami masa sulit. Jika Anda
            merasa ingin menyakiti diri sendiri atau dalam bahaya, mohon segera
            cari bantuan.
          </DialogDescription>

          {/* Emergency contacts */}
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <h4 className="text-sm font-semibold text-gray-900">
                Layanan Darurat (24 Jam)
              </h4>
            </div>

            <a
              href="tel:119"
              className="group mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white p-3 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-5 text-gray-900">
                    LISA (Pencegahan Bunuh Diri)
                  </span>
                  <span className="block text-xs text-gray-500">Indonesia</span>
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                119 ext 8
              </span>
            </a>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Anda juga bisa menghubungi orang terdekat atau profesional
              kesehatan mental.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
            <Button
              type="button"
              onClick={() => {
                if (onContactSupport) {
                  onContactSupport();
                } else {
                  window.open("tel:119", "_self");
                }
              }}
              className="w-full justify-center gap-2 bg-primary text-white shadow-md transition-colors hover:bg-primary/90 sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              Hubungi Bantuan
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 sm:w-auto"
            >
              Saya Mengerti, Lanjut Menulis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
