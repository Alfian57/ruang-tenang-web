"use client";

import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface ContentWarningOverlayProps {
  children: React.ReactNode;
  warningText?: string;
  blurAmount?: "sm" | "md" | "lg";
  className?: string;
}

export function ContentWarningOverlay({
  children,
  warningText = "Konten ini mungkin mengandung materi sensitif.",
  // blurAmount = "md",
  className,
}: ContentWarningOverlayProps) {
  const [show, setShow] = useState(false);

  if (show) {
    return (
      <div className={cn("relative", className)}>
        {children}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
        >
          <EyeOff className="w-4 h-4 mr-2" />
          Sembunyikan
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-amber-200 bg-amber-50 p-6 text-center",
        className
      )}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Peringatan Konten</h3>
        <p className="text-gray-600 mb-6 max-w-sm">{warningText}</p>
        <Button onClick={() => setShow(true)} className="bg-amber-600 hover:bg-amber-700">
          <Eye className="w-4 h-4 mr-2" />
          Lihat Konten
        </Button>
      </div>
      
      {/* Blurred background preview */}
      <div className={cn("absolute inset-0 opacity-20 pointer-events-none blur-sm z-[-1]")}>
         {children}
      </div>
    </div>
  );
}
