import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleEditorShellProps = {
  backHref: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ArticleEditorShell({ backHref, title, description, children }: ArticleEditorShellProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-0 pb-10 pt-4 sm:pt-6">
      <section className="theme-accent-border-soft relative isolate mb-10 min-h-64 overflow-visible rounded-3xl border bg-[linear-gradient(120deg,var(--theme-accent-soft),white_72%)] p-5 shadow-sm sm:min-h-[17.5rem] sm:p-7 lg:min-h-72">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-theme-accent-light/60 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl lg:max-w-[66%]">
          <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2 gap-2 rounded-xl text-slate-600 hover:bg-white/70">
            <Link href={backHref}><ArrowLeft className="h-4 w-4" /> Kembali ke artikel</Link>
          </Button>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark">
            <FileText className="h-3.5 w-3.5" /> Ruang berbagi
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        </div>
        <div className="pointer-events-none absolute -bottom-10 right-3 z-0 hidden h-64 w-56 items-end justify-center overflow-visible lg:flex sm:right-5 lg:right-8">
          <div className="absolute bottom-5 right-0 h-52 w-52 rounded-full bg-theme-accent-light/70 blur-sm" />
          <Image
            src="/images/landing/mascot/read.webp"
            alt=""
            aria-hidden="true"
            width={320}
            height={400}
            sizes="220px"
            className="relative h-full w-auto max-w-none object-contain object-bottom drop-shadow-xl"
          />
        </div>
      </section>

      <Card className="theme-accent-border-soft mx-auto max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-theme-accent-soft text-theme-accent-dark">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Detail artikel</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Judul, kategori, gambar, dan isi tulisanmu.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-7">{children}</CardContent>
      </Card>
    </div>
  );
}
