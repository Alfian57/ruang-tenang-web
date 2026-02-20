"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIDisclaimerBannerProps {
  onDismiss?: () => void;
}

export function AIDisclaimerBanner({ onDismiss }: AIDisclaimerBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="bg-sky-50 border-b border-sky-200 px-4 py-3 flex items-start gap-3 relative animate-in slide-in-from-top-2">
      <AlertTriangle className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-sky-950 pr-6">
        <p className="font-medium">Penting: Bukan Pengganti Profesional</p>
        <p className="mt-1 text-sky-800">
          AI Chat ini dirancang untuk dukungan emosional awal. Jika Anda dalam krisis atau membutuhkan bantuan serius,
          silakan hubungi tenaga profesional atau layanan darurat.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-sky-600 hover:text-sky-800 hover:bg-sky-100 absolute top-2 right-2"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
