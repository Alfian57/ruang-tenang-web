import {
    Clock3,
    Gamepad2,
    Heart,
    MousePointer2,
    ShieldCheck,
    Sparkles,
    Star,
    WifiOff,
} from "lucide-react";
import MindfulRunnerGame from "@/components/game/LazyMindfulRunnerGame";

const SESSION_DETAILS = [
    { icon: Clock3, label: "Jeda 2–3 menit" },
    { icon: WifiOff, label: "Tersedia offline" },
    { icon: Sparkles, label: "Mengikuti tema" },
];

const GAME_GUIDE = [
    {
        icon: MousePointer2,
        title: "Temukan ritme",
        description: "Tahan klik, tap, atau Spasi untuk melompat lebih tinggi. Tekan lagi untuk lompatan ganda.",
    },
    {
        icon: Heart,
        title: "Kumpulkan ketenangan",
        description: "Kepedulian diri dan kejernihan menambah skor. Rangkaian collectible membangun combo.",
    },
    {
        icon: ShieldCheck,
        title: "Jaga ruang aman",
        description: "Perisai Tenang menyerap satu obstacle dan memberimu kesempatan untuk melanjutkan.",
    },
];

export default function GamePage() {
    return (
        <div className="relative isolate min-h-full overflow-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div
                className="pointer-events-none absolute -right-28 -top-28 -z-10 h-80 w-80 rounded-full blur-3xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent-light, #ffedd5) 55%, transparent)" }}
            />
            <div
                className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-96 w-96 rounded-full blur-3xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent-soft, #fff7ed) 66%, transparent)" }}
            />

            <div className="mx-auto max-w-[92rem] space-y-5 lg:space-y-6">
                <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div
                            className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em]"
                            style={{
                                borderColor: "var(--theme-accent-border, #fed7aa)",
                                backgroundColor: "var(--theme-accent-soft, #fff7ed)",
                                color: "var(--theme-accent-dark, #c2410c)",
                            }}
                        >
                            <Gamepad2 className="h-3.5 w-3.5" />
                            Mindful break
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-[2.15rem]">
                            Mindful Runner
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                            Sebuah perjalanan singkat untuk melewati beban pikiran, menemukan ritme, dan mengumpulkan momen tenang.
                        </p>
                    </div>

                    <div className="-mx-1 flex max-w-full flex-nowrap gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:justify-end lg:overflow-visible lg:px-0 lg:pb-0">
                        {SESSION_DETAILS.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur"
                            >
                                <Icon className="h-3.5 w-3.5" style={{ color: "var(--theme-accent, #f97316)" }} />
                                {label}
                            </div>
                        ))}
                    </div>
                </header>

                <section
                    aria-label="Arena Mindful Runner"
                    className="relative overflow-hidden rounded-[2rem] border p-2 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.65)] sm:p-3 lg:p-4"
                    style={{
                        borderColor: "var(--theme-accent-border, #fed7aa)",
                        background: "linear-gradient(145deg, color-mix(in srgb, var(--theme-accent-soft, #fff7ed) 72%, white), rgba(255,255,255,0.96) 48%, color-mix(in srgb, var(--theme-accent-light, #ffedd5) 34%, white))",
                    }}
                >
                    <div
                        className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full border"
                        style={{ borderColor: "var(--theme-accent-border, #fed7aa)" }}
                    />
                    <div
                        className="pointer-events-none absolute -right-7 -top-14 h-32 w-32 rounded-full border"
                        style={{ borderColor: "var(--theme-accent-border, #fed7aa)" }}
                    />

                    <div className="relative rounded-[1.65rem] bg-white/[0.72] p-1.5 backdrop-blur-sm sm:p-2">
                        <MindfulRunnerGame />
                    </div>
                </section>

                <section aria-labelledby="game-guide-title">
                    <div className="mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" style={{ color: "var(--theme-accent, #f97316)" }} />
                        <h2 id="game-guide-title" className="text-sm font-bold text-slate-800">Bekal perjalanan</h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {GAME_GUIDE.map(({ icon: Icon, title, description }) => (
                            <article
                                key={title}
                                className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur transition-colors hover:border-theme-accent/30"
                            >
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:-translate-y-0.5"
                                    style={{ backgroundColor: "var(--theme-accent-soft, #fff7ed)" }}
                                >
                                    <Icon className="h-[18px] w-[18px]" style={{ color: "var(--theme-accent-dark, #c2410c)" }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
