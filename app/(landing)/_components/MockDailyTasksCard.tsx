"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Flame, Zap } from "lucide-react";

const MOCK_TASKS = [
    { name: "Login Harian", icon: "🔑", done: true, xp: 10, coin: 1 },
    { name: "Rekam Mood", icon: "💝", done: true, xp: 15, coin: 2 },
    { name: "Chat AI", icon: "💬", done: false, xp: 20, coin: 2 },
    { name: "Baca Artikel", icon: "📖", done: false, xp: 15, coin: 1 },
];

export function MockDailyTasksCard() {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">Daily Tasks</h3>
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium border border-gray-200">
                            Preview
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">Selesaikan tugas untuk dapat XP & Gold Coin!</p>
                </div>
                <div
                    className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full"
                    title="Contoh Streak"
                >
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">7 hari 🔥</span>
                </div>
            </div>

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
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-xl border ${task.done
                            ? "bg-green-50/50 border-green-200"
                            : "bg-gray-50/50 border-gray-100"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{task.icon}</span>
                            <span
                                className={`font-medium text-sm ${task.done ? "text-green-700" : "text-gray-700"
                                    }`}
                            >
                                {task.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                +{task.xp} XP
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Image src="/coin.png" alt="Gold Coin" width={12} height={12} />
                                +{task.coin}
                            </span>
                            {task.done && <span className="text-green-500 text-lg">✓</span>}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Reward Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-semibold text-gray-700">Total hari ini</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-orange-500">
                        +25 XP
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700">
                        <Image src="/coin.png" alt="Gold Coin" width={14} height={14} />
                        +3
                    </span>
                </div>
            </div>
        </div>
    );
}
