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
        title: "Misi Harian",
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
        week: "Peta Perjalanan",
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
        q: "Apa bedanya Peta Perjalanan dengan Leaderboard?",
        a: "Peta Perjalanan fokus ke progres personal seperti membuka area, landmark, dan klaim reward. Leaderboard fokus ke ranking XP antar pengguna.",
    },
];

export default function GamificationPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-red-50/50 via-white to-white">
            <Navbar variant="back" />

            <main className="container relative z-10 mx-auto px-4 pt-28 pb-16 sm:pt-32 sm:pb-20">
                <section className="mb-10 text-center sm:mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm"
                    >
                        <Trophy className="w-4 h-4" />
                        Panduan Gamifikasi
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="mb-5 text-3xl font-bold leading-tight text-gray-900 md:text-5xl"
                    >
                        Cara Kerja Gamifikasi{" "}
                        <span className="bg-linear-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                            Ruang Tenang
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg"
                    >
                        Semua poin di halaman ini merujuk ke fitur yang sudah aktif di
                        dashboard: guild, progress map, coin rewards, breathing streak,
                        hingga perjalanan level dan badge.
                    </motion.p>
                </section>

                <section className="mx-auto mb-10 max-w-6xl sm:mb-14">
                    <div className="flex items-center gap-2 mb-5">
                        <Sparkles className="h-5 w-5 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Loop Progres yang Aktif di Produk</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
                        {GAME_LOOP_STEPS.map((step, index) => (
                            <motion.article
                                key={step.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: Math.min(index * 0.06, 0.24) }}
                                className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                                        <step.icon className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>
                                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                            {step.metric}
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>

                <section className="mx-auto mb-10 max-w-6xl sm:mb-14">
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="rounded-3xl border border-red-100 bg-white p-4 lg:col-span-7 md:p-7">
                            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">Fitur Mencolok di Ekosistem Gamifikasi</h2>
                            <div className="space-y-3">
                                {THIRTY_DAY_PLAN.map((plan, index) => (
                                    <motion.div
                                        key={plan.week}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(index * 0.08, 0.2) }}
                                        className="rounded-2xl border border-red-100 p-4"
                                    >
                                        <p className="text-xs font-semibold text-primary mb-1">{plan.week}</p>
                                        <h3 className="font-bold text-gray-900 mb-1">{plan.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{plan.focus}</p>
                                        <p className="text-xs font-semibold text-red-700">{plan.target}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-red-200 bg-linear-to-b from-red-50 to-rose-50 p-4 lg:col-span-5 md:p-7">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Strategi Main Berdasarkan Fitur Nyata</h3>
                            <div className="space-y-3">
                                {STRATEGY_CARDS.map((item) => (
                                    <div key={item.title} className="rounded-2xl bg-white/80 border border-white p-4">
                                        <div className="flex items-start gap-3">
                                            <item.icon className="mt-0.5 h-5 w-5 text-red-700" />
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

                <section className="mx-auto mb-10 max-w-5xl sm:mb-14">
                    <h2 className="mb-4 text-center text-xl font-bold text-gray-900 sm:text-2xl">Pertanyaan Umum</h2>
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
                    className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-linear-to-r from-red-50 to-rose-50 px-5 py-7 md:px-10 md:py-10"
                >
                    <div className="text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
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
