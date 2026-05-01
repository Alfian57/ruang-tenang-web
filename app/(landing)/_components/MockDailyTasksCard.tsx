"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BookOpen, Check, Flame, HeartPulse, KeyRound, MessageCircle, Zap } from "lucide-react";
import { LandingDataNotice } from "./LandingDataNotice";

const MOCK_TASKS = [
    { name: "Login Harian", icon: KeyRound, done: true, xp: 10, coin: 1 },
    { name: "Rekam Mood", icon: HeartPulse, done: true, xp: 15, coin: 2 },
    { name: "Chat AI", icon: MessageCircle, done: false, xp: 20, coin: 2 },
    { name: "Baca Artikel", icon: BookOpen, done: false, xp: 15, coin: 1 },
];

export function MockDailyTasksCard() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-red-100 bg-white p-4 shadow-xl shadow-red-950/5 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Contoh Misi Harian</h3>
                    <p className="text-sm text-gray-500">Simulasi tugas harian untuk menunjukkan alur XP dan Koin Emas.</p>
                </div>
                <div
                    className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5"
                    title="Contoh streak"
                >
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold text-red-600">Contoh 7 hari</span>
                </div>
            </div>

            <LandingDataNotice variant="demo" className="mb-5" />

            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-semibold text-primary">2/4 selesai</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "50%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-linear-to-r from-primary to-red-400 h-2.5 rounded-full"
                    />
                </div>
            </div>

            {/* Task items */}
            <div className="space-y-3">
                {MOCK_TASKS.map((task, idx) => (
                    <motion.div
                        key={task.name}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${task.done
                            ? "border-red-200 bg-red-50/60"
                            : "border-rose-100 bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`grid h-8 w-8 place-items-center rounded-lg ${task.done ? "bg-white text-red-600" : "bg-rose-50 text-rose-500"
                                    }`}
                            >
                                <task.icon className="h-4 w-4" />
                            </div>
                            <span
                                className={`font-medium text-sm ${task.done ? "text-red-700" : "text-gray-700"
                                    }`}
                            >
                                {task.name}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                                +{task.xp} XP
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Image src="/coin.png" alt="Koin Emas" width={12} height={12} />
                                +{task.coin}
                            </span>
                            {task.done && <Check className="h-4 w-4 text-red-500" />}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Reward Summary */}
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-semibold text-gray-700">Total contoh</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-linear-to-r from-red-600 to-rose-500 bg-clip-text text-lg font-bold text-transparent">
                        +25 XP
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700">
                        <Image src="/coin.png" alt="Koin Emas" width={14} height={14} />
                        +3
                    </span>
                </div>
            </div>
        </div>
    );
}
