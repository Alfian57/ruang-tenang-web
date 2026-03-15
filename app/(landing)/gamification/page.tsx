"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { ROUTES } from "@/lib/routes";
import {
    CalendarCheck,
    Clock3,
    Swords,
    Map,
    Gift,
    Gamepad2,
    ArrowRight,
    Users,
    Trophy,
    Sparkles,
} from "lucide-react";

const GAME_LOOP_STEPS = [
    {
        icon: CalendarCheck,
        title: "Daily Task",
        description:
            "Misi harian punya target dan progress count. Setelah selesai, reward XP dan koin diklaim langsung dari widget.",
        metric: "Sumber progres harian utama",
    },
    {
        icon: Trophy,
        title: "XP, Level, Tier, dan Badge",
        description:
            "Widget Perjalananmu menampilkan level saat ini, XP ke level berikutnya, tier, XP mingguan/bulanan, dan jumlah badge.",
        metric: "Sinkron ke Community Journey",
    },
    {
        icon: Clock3,
        title: "Breathing Streak + Milestone",
        description:
            "Latihan napas punya current streak, warning saat streak berisiko putus, dan milestone bonus XP.",
        metric: "Streak memengaruhi bonus progres",
    },
    {
        icon: Gift,
        title: "Coin Economy & Rewards",
        description:
            "Koin emas dari aktivitas dipakai untuk klaim hadiah dengan mekanik saldo, stok, histori klaim, dan ownership item theme.",
        metric: "Loop task -> coin -> reward",
    },
];

const THIRTY_DAY_PLAN = [
    {
        week: "Guild System",
        title: "Progres Bareng di Dalam Guild",
        focus: "Kamu bisa membuat atau bergabung ke guild, mengundang teman lewat kode, lalu membangun kontribusi XP bersama tim.",
        target: "Selesaikan challenge guild bersama: XP, tugas harian, breathing, jurnal, chat, dan streak.",
    },
    {
        week: "Progress Map",
        title: "Unlock Region dan Landmark",
        focus: "Peta perjalanan berisi region + landmark dengan syarat unlock, progress persen, dan status reward claimed.",
        target: "Setiap landmark dapat memberi XP dan koin",
    },
    {
        week: "Community Journey",
        title: "Dashboard Evolusi Personal",
        focus: "Tab journey/stats/badges menampilkan personal progress, badge showcase, dan data yang terhubung ke leaderboard.",
        target: "Memudahkan evaluasi progres per minggu",
    },
];

const STRATEGY_CARDS = [
    {
        icon: Swords,
        title: "Guild First",
        description: "Saat motivasi turun, challenge tim di guild bantu menjaga konsistensi lewat akuntabilitas sosial.",
    },
    {
        icon: Map,
        title: "Map Completion",
        description: "Prioritaskan landmark terdekat syaratnya untuk panen XP + koin secara stabil.",
    },
    {
        icon: Gamepad2,
        title: "Recovery Mode",
        description: "Saat energi rendah, gunakan mode ringan seperti breathing atau Mindful Runner agar ritme tetap jalan.",
    },
];

const FAQ_ITEMS = [
    {
        q: "Apakah akun bisa ikut lebih dari satu guild sekaligus?",
        a: "Flow saat ini menggunakan satu guild aktif per akun. Kamu bisa keluar dari guild sekarang lalu gabung guild lain.",
    },
    {
        q: "Koin emas dipakai untuk apa?",
        a: "Koin dipakai untuk klaim hadiah di halaman Rewards. Sistem mengecek saldo, stok item, dan menyimpan riwayat klaim.",
    },
    {
        q: "Apa bedanya Progress Map dengan Leaderboard?",
        a: "Progress Map fokus ke progres personal (unlock area/landmark + claim reward), sedangkan leaderboard fokus ranking XP antar pengguna.",
    },
];

export default function GamificationPage() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            <Navbar variant="back" />

            <div className="absolute top-0 right-0 w-125 h-125 bg-yellow-100/45 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute top-24 left-0 w-100 h-100 bg-orange-100/35 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
                <section className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full text-yellow-700 font-medium text-sm mb-6"
                    >
                        <Trophy className="w-4 h-4" />
                        Blueprint Gamifikasi
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-5"
                    >
                        Cara Kerja Gamifikasi{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-orange-500">
                            Ruang Tenang
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
                    >
                        Semua poin di halaman ini merujuk ke fitur yang sudah aktif di
                        dashboard: guild, progress map, coin rewards, breathing streak,
                        hingga perjalanan level dan badge.
                    </motion.p>
                </section>

                <section className="max-w-6xl mx-auto mb-16">
                    <div className="flex items-center gap-2 mb-5">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-bold text-gray-900">Loop Progres yang Aktif di Produk</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                        {GAME_LOOP_STEPS.map((step, index) => (
                            <motion.article
                                key={step.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: Math.min(index * 0.06, 0.24) }}
                                className="rounded-3xl border border-amber-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                        <step.icon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>
                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                            {step.metric}
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>

                <section className="max-w-6xl mx-auto mb-16">
                    <div className="grid lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-7 rounded-3xl border border-gray-200 bg-white p-6 md:p-7">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fitur Mencolok di Ekosistem Gamifikasi</h2>
                            <div className="space-y-3">
                                {THIRTY_DAY_PLAN.map((plan, index) => (
                                    <motion.div
                                        key={plan.week}
                                        initial={{ opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(index * 0.08, 0.2) }}
                                        className="rounded-2xl border border-gray-200 p-4"
                                    >
                                        <p className="text-xs font-semibold text-primary mb-1">{plan.week}</p>
                                        <h3 className="font-bold text-gray-900 mb-1">{plan.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{plan.focus}</p>
                                        <p className="text-xs text-emerald-700 font-semibold">{plan.target}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-5 rounded-3xl border border-cyan-200 bg-linear-to-b from-cyan-50 to-sky-50 p-6 md:p-7">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Strategi Main Berdasarkan Fitur Nyata</h3>
                            <div className="space-y-3">
                                {STRATEGY_CARDS.map((item) => (
                                    <div key={item.title} className="rounded-2xl bg-white/80 border border-white p-4">
                                        <div className="flex items-start gap-3">
                                            <item.icon className="w-5 h-5 text-cyan-700 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Pertanyaan Umum</h2>
                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item) => (
                            <details key={item.q} className="group rounded-2xl border border-gray-200 bg-white p-4 open:shadow-sm">
                                <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between gap-3">
                                    {item.q}
                                    <span className="text-primary text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                                </summary>
                                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto rounded-3xl border border-yellow-200 bg-linear-to-r from-yellow-50 to-orange-50 px-6 py-8 md:px-10 md:py-10"
                >
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-gray-700 text-sm font-medium border border-yellow-200 mb-4">
                            <Users className="w-4 h-4 text-primary" />
                            Langkah Berikutnya
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            Praktekkan Strateginya di Produk Asli
                        </h3>
                        <p className="text-gray-600 mb-7 max-w-2xl mx-auto">
                            Kalau kamu sudah paham mekaniknya, lanjutkan ke komunitas untuk
                            dukungan sosial atau lihat leaderboard untuk memantau progresmu.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href={ROUTES.HALL_OF_FAME}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-gray-800 px-6 py-3 font-semibold hover:bg-gray-50 transition"
                            >
                                Lihat Hall of Fame
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.section>
            </main>

            <Footer />
        </div>
    );
}