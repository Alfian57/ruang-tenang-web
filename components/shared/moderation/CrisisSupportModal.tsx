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
          "sm:max-w-md"
        )}
      >
        <div className="flex items-center gap-3 pt-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Anda Tidak Sendirian</DialogTitle>
        </div>

        <div className="space-y-4">
          <DialogDescription className="text-sm leading-6">
            Kami mendeteksi Anda mungkin sedang mengalami masa sulit. Jika Anda
            merasa ingin menyakiti diri sendiri atau dalam bahaya, mohon segera
            cari bantuan.
          </DialogDescription>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Layanan Darurat (24 Jam)</h4>
            </div>

            <a
              href="tel:119"
              className="group flex items-center justify-between gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-primary/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    LISA (Pencegahan Bunuh Diri)
                  </div>
                  <div className="text-xs text-muted-foreground">Indonesia</div>
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                119 ext 8
              </div>
            </a>

            <p className="mt-3 text-xs text-muted-foreground">
              Anda juga bisa menghubungi orang terdekat atau profesional kesehatan mental.
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Saya Mengerti, Lanjut Menulis
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (onContactSupport) {
                onContactSupport();
              } else {
                window.open("tel:119", "_self");
              }
            }}
            className="gap-2"
          >
            <Phone className="h-4 w-4" />
            Hubungi Bantuan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
