import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookHeart, Heart, MessageCircleHeart, MoonStar, PenLine, Sparkles, Star, Wind } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { LandingDataNotice } from "./LandingDataNotice";
import { LandingPrimaryCTA } from "./LandingPrimaryCTA";

const MASCOT = "/images/landing/mascot";

const FEATURES = [
  { title: "Kenali perasaanmu", description: "Check-in mood membantumu memberi nama pada apa yang sedang terasa.", image: "mood", alt: "Maskot Ruang Tenang memegang hati dengan lembut", icon: Heart, tone: "peach" },
  { title: "Urai isi pikiran", description: "Tulis jurnal singkat, bahkan ketika kamu belum tahu harus mulai dari mana.", image: "journal", alt: "Maskot Ruang Tenang menulis dalam jurnal", icon: PenLine, tone: "lilac" },
  { title: "Ada teman bicara", description: "Berbincang dengan AI untuk refleksi yang terasa lebih terarah.", image: "companion", alt: "Maskot Ruang Tenang mengajak berbincang", icon: MessageCircleHeart, tone: "blue" },
  { title: "Ambil jeda tenang", description: "Latihan napas dan musik relaksasi menemanimu beristirahat sejenak.", image: "breathe", alt: "Maskot Ruang Tenang duduk tenang sambil bernapas", icon: Wind, tone: "cream" },
] as const;

const STEPS = [
  { number: "01", label: "Check-in", detail: "Sadari suasana hati hari ini." },
  { number: "02", label: "Refleksi", detail: "Tulis atau ceritakan yang mengganjal." },
  { number: "03", label: "Jeda", detail: "Pilih napas atau musik yang menenangkan." },
  { number: "04", label: "Bertumbuh", detail: "Lihat langkah kecilmu menjadi progres." },
] as const;

export function LandingStatic({ part }: { part: "intro" | "outro" }) {
  if (part === "outro") {
    return (
      <section className="relative px-5 pb-24 pt-12 sm:pb-32 sm:pt-18">
        <div className="landing-final relative mx-auto grid max-w-7xl items-center gap-3 rounded-[2.5rem] px-7 py-10 sm:px-12 lg:grid-cols-[1fr_0.65fr] lg:px-16 lg:py-14">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#bb4c59]"><BookHeart size={15} aria-hidden="true" /> Di sini untukmu</span>
            <h2 className="font-brand-display mt-5 text-[clamp(2.2rem,4.5vw,4rem)] font-extrabold leading-[1.14] tracking-[-0.035em] text-[#283048]">Mulai saat kamu <span className="text-[#d84f5f]">siap.</span></h2>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-600">Tak harus langsung baik-baik saja. Cukup mulai dengan memberi sedikit ruang untuk dirimu hari ini.</p>
            <div className="mt-7"><LandingPrimaryCTA /></div>
            <p className="mt-5 text-xs leading-5 text-slate-500">Ruang Tenang mendukung refleksi diri, bukan pengganti bantuan profesional.</p>
          </div>
          <div className="relative mx-auto mt-12 h-56 w-full max-w-72 sm:h-64 lg:mt-0 lg:h-72">
            <Image src={`${MASCOT}/heart.webp`} alt="Maskot Ruang Tenang memeluk hati bercahaya" width={640} height={960} sizes="(max-width: 1024px) 220px, 280px" className="absolute -bottom-11 left-1/2 h-[145%] w-auto max-w-none -translate-x-1/2 object-contain lg:-bottom-14" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="home" className="landing-hero relative isolate px-5 pb-22 pt-34 sm:pb-28 sm:pt-40 lg:pb-36">
        <div className="landing-orbit landing-orbit-one" aria-hidden="true" />
        <div className="landing-orbit landing-orbit-two" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-brand-display text-[clamp(2.8rem,6vw,5.6rem)] font-extrabold leading-[1.07] tracking-[-0.045em] text-[#252b43]">
              Saat hari terasa penuh, <span className="text-[#dc4b58]">ada ruang untukmu.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Di tengah kesibukan kuliah, kamu boleh berhenti sejenak. Kenali perasaanmu, tulis refleksi, dan temukan langkah kecil bersama Ruang Tenang.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LandingPrimaryCTA />
              <Link href="#features" className="landing-button-secondary">Lihat caranya <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2"><span className="landing-tiny-star">✦</span> Mulai sesuai ritmemu</span>
              <span className="inline-flex items-center gap-2"><span className="landing-tiny-star">✦</span> Ruang refleksi yang aman</span>
            </div>
          </div>
          <div className="landing-hero-stage relative mx-auto mt-6 h-[390px] w-full max-w-[510px] sm:h-[480px] lg:mt-0 lg:h-[550px]">
            <div className="landing-hero-blob absolute inset-x-3 bottom-2 top-12 rounded-[42%_58%_42%_58%/44%_42%_58%_56%]" aria-hidden="true" />
            <div className="landing-ring absolute right-3 top-1 h-28 w-28 rounded-full sm:h-36 sm:w-36" aria-hidden="true" />
            <Star className="absolute right-[8%] top-[12%] z-10 h-7 w-7 rotate-12 text-[#e5ad57] sm:h-9 sm:w-9" fill="currentColor" aria-hidden="true" />
            <Image src={`${MASCOT}/welcome.webp`} alt="Maskot Ruang Tenang melambaikan tangan sambil membawa bola cahaya" width={768} height={1152} priority sizes="(max-width: 640px) 300px, (max-width: 1024px) 390px, 480px" className="landing-hero-mascot absolute bottom-[-10%] left-1/2 z-10 h-[112%] w-auto max-w-none -translate-x-1/2 object-contain" />
            <div className="landing-floating-card absolute -left-2 top-[24%] z-20 rotate-[-7deg] sm:-left-8"><Heart size={17} fill="#fb7185" className="text-[#fb7185]" aria-hidden="true" /><span>Perasaanmu berarti</span></div>
            <div className="landing-floating-card absolute -right-2 bottom-[15%] z-20 rotate-[6deg] sm:-right-8"><MoonStar size={18} className="text-[#7884cc]" aria-hidden="true" /><span>Pelan-pelan saja</span></div>
          </div>
        </div>
        <div className="landing-hero-wave" aria-hidden="true" />
      </section>

      <section id="features" className="relative px-5 pb-20 pt-13 sm:pb-28 sm:pt-18">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="landing-section-kicker">KENALAN DULU, YUK</span>
            <h2 className="landing-section-title mt-4">Banyak cara untuk <span>merasa lebih lega.</span></h2>
            <p className="landing-section-copy mx-auto mt-4">Tak perlu melakukan semuanya sekaligus. Pilih hal kecil yang paling kamu butuhkan hari ini.</p>
          </div>
          <div className="mt-25 grid gap-x-5 gap-y-22 md:grid-cols-2 xl:grid-cols-4 xl:gap-y-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className={`landing-feature-card landing-feature-${feature.tone} relative rounded-[2rem] px-6 pb-7 pt-31 shadow-[0_20px_50px_-35px_rgba(57,34,65,0.35)]`}>
                  <div className="absolute -top-18 left-1/2 h-47 w-40 -translate-x-1/2 sm:h-50 sm:w-44">
                    <Image src={`${MASCOT}/${feature.image}.webp`} alt={feature.alt} width={480} height={720} sizes="(max-width: 768px) 176px, 160px" className="h-full w-full object-contain" />
                  </div>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-[#cb5360] shadow-sm"><Icon size={21} aria-hidden="true" /></div>
                  <h3 className="font-brand-display text-xl font-extrabold text-[#283048]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="journey" className="landing-journey relative px-5 py-22 sm:py-28">
        <span id="gamification" className="landing-anchor" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <span className="landing-section-kicker">PERJALANANMU</span>
              <h2 className="landing-section-title mt-4">Langkah kecil juga <span>patut dirayakan.</span></h2>
              <p className="landing-section-copy mt-5">Ruang Tenang membantumu membangun kebiasaan merawat diri, satu hari dan satu langkah pada satu waktu.</p>
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {STEPS.map((step) => (
                  <div key={step.number} className="landing-step rounded-[1.4rem] border border-white bg-white/80 p-4 shadow-[0_12px_35px_-28px_#6b3655]">
                    <span className="font-brand-display text-sm font-black text-[#d95c6a]">{step.number}</span>
                    <h3 className="mt-1 font-brand-display text-lg font-bold text-[#283048]">{step.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
              <Link href={ROUTES.GAMIFICATION} className="landing-text-link mt-8">Kenali perjalanan &amp; reward <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="relative mx-auto w-full max-w-[650px] pb-8 pt-14 sm:pt-20">
              <div className="landing-demo-card relative z-10 rounded-[2.4rem] border border-white bg-white/90 p-5 shadow-[0_30px_80px_-40px_rgba(75,49,98,0.42)] sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d45e69]">Contoh perjalanan</span><h3 className="font-brand-display mt-1 text-xl font-extrabold text-[#283048]">Hari ini, untuk dirimu</h3></div><div className="rounded-2xl bg-[#fff1e7] p-3 text-[#d88956]"><Sparkles size={22} aria-hidden="true" /></div></div>
                <div className="rounded-[1.6rem] bg-[#fff4f2] p-4 sm:p-5"><div className="flex items-center justify-between text-sm font-bold text-[#343b53]"><span>Check-in suasana hati</span><span className="text-[#c94d5a]">● ● ● ○ ○</span></div><p className="mt-2 text-sm text-slate-600">“Apa yang paling kamu butuhkan hari ini?”</p><div className="mt-4 flex flex-wrap gap-2"><span className="landing-demo-chip">Jeda sejenak</span><span className="landing-demo-chip">Didengarkan</span><span className="landing-demo-chip">Semangat baru</span></div></div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-[1.5rem] bg-[#f1f3ff] p-4"><span className="flex items-center gap-2 text-sm font-bold text-[#4b5482]"><PenLine size={17} aria-hidden="true" /> Jurnal singkat</span><div className="mt-4 h-2 w-full rounded-full bg-white" /><div className="mt-2 h-2 w-4/5 rounded-full bg-white" /><div className="mt-2 h-2 w-3/5 rounded-full bg-white" /></div><div className="rounded-[1.5rem] bg-[#fff8e9] p-4"><span className="flex items-center gap-2 text-sm font-bold text-[#855d36]"><Star size={17} aria-hidden="true" /> Misi harian</span><p className="mt-3 text-sm text-[#6f604e]">Satu refleksi kecil hari ini</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-2/3 rounded-full bg-[#e9a862]" /></div></div></div>
                <LandingDataNotice variant="demo" className="mt-5" />
              </div>
              <Image src={`${MASCOT}/celebrate.webp`} alt="Maskot Ruang Tenang merayakan langkah kecil" width={640} height={960} sizes="(max-width: 640px) 140px, 220px" className="absolute -right-3 -top-15 z-20 h-44 w-auto -rotate-8 object-contain drop-shadow-[0_15px_20px_rgba(155,72,92,0.14)] sm:-right-10 sm:-top-22 sm:h-61" />
              <span className="landing-deco-star absolute -bottom-2 left-0" aria-hidden="true">✳</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
