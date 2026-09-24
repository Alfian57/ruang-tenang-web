import Image from "next/image";
import type { ReactNode } from "react";

export function DashboardMascotEmpty({ title, description, image, action }: { title: string; description: string; image: string; action?: ReactNode }) {
  return <div className="col-span-full flex flex-col items-center rounded-[1.75rem] border border-dashed border-theme-accent-border bg-white/80 px-5 py-8 text-center sm:py-10">
    <Image src={image} alt="" width={120} height={150} className="h-28 w-auto object-contain" />
    <h3 className="mt-2 text-lg font-bold text-slate-900">{title}</h3>
    <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>;
}
