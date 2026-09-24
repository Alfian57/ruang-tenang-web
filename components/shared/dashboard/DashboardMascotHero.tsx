import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  action?: ReactNode;
};

/** Theme-aware hub introduction; the mascot intentionally overlaps its frame. */
export function DashboardMascotHero({ eyebrow, title, description, image, imageAlt, action }: Props) {
  return (
    <section data-user-tour="page-hero" className="theme-accent-border-soft relative isolate mb-8 mt-5 flex min-h-56 items-center rounded-[2rem] border bg-[linear-gradient(120deg,var(--theme-accent-soft),white_72%)] px-5 py-7 shadow-sm sm:min-h-60 sm:px-8 sm:py-9 lg:mb-12 lg:mt-7 lg:min-h-72 lg:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-theme-accent-light/60 blur-3xl" />
        <div className="theme-accent-border-soft absolute bottom-4 right-32 hidden h-20 w-20 rounded-full border lg:block" />
      </div>
      <div className="relative z-10 max-w-[70%] sm:max-w-[68%] lg:max-w-[65%]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-theme-accent-dark">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
      <Image src={image} alt={imageAlt} width={320} height={400} priority className="pointer-events-none absolute -bottom-3 -right-2 z-0 h-44 w-auto max-w-[48%] object-contain object-bottom drop-shadow-xl sm:-bottom-5 sm:right-3 sm:h-56 lg:bottom-auto lg:right-3 lg:top-4 lg:h-72" sizes="(max-width: 640px) 150px, (max-width: 1024px) 220px, 280px" />
    </section>
  );
}
