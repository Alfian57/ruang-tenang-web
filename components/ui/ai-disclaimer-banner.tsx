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
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 px-4 py-3 flex items-start gap-3 relative animate-in slide-in-from-top-2">
      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-amber-900 dark:text-amber-100 pr-6">
        <p className="font-medium">Penting: Bukan Pengganti Profesional</p>
        <p className="mt-1 opacity-90">
          AI Chat ini dirancang untuk dukungan emosional awal. Jika Anda dalam krisis atau membutuhkan bantuan serius, 
          silakan hubungi tenaga profesional atau layanan darurat.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900 absolute top-2 right-2"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
