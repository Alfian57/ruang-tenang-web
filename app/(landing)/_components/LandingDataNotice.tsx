"use client";

import { Info, ShieldCheck } from "lucide-react";

type LandingDataNoticeProps = {
  variant: "demo" | "public";
  className?: string;
};

const NOTICE_COPY = {
  demo: {
    icon: Info,
    label: "Simulasi pengalaman publik",
    description: "Bukan data akun Anda dan tidak membaca aktivitas pribadi.",
    className: "border-amber-200 bg-amber-50 text-amber-900",
    iconClassName: "text-amber-600",
  },
  public: {
    icon: ShieldCheck,
    label: "Data publik komunitas",
    description: "Tidak menampilkan data pribadi Anda sebelum login.",
    className: "border-sky-200 bg-sky-50 text-sky-900",
    iconClassName: "text-sky-600",
  },
} as const;

export function LandingDataNotice({ variant, className = "" }: LandingDataNoticeProps) {
  const copy = NOTICE_COPY[variant];
  const Icon = copy.icon;

  return (
    <div className={`inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${copy.className} ${className}`}>
      <Icon className={`h-4 w-4 shrink-0 ${copy.iconClassName}`} />
      <span className="min-w-0">
        <span className="font-semibold">{copy.label}</span>
        <span className="ml-1 opacity-80">{copy.description}</span>
      </span>
    </div>
  );
}
