"use client";

import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import MindfulRunnerGame from "@/components/game/MindfulRunnerGame";

export default function GamePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Mindful Runner</h1>
                    <p className="text-sm text-gray-500">
                        Hindari pikiran negatif dan kumpulkan ketenangan
                    </p>
                </div>
            </motion.div>

            {/* Game */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
                <MindfulRunnerGame />
            </motion.div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <h3 className="font-semibold text-red-800 text-sm mb-1">🧘 Cara Bermain</h3>
                    <p className="text-xs text-red-600">
                        Tekan SPASI, ↑, atau tap layar untuk melompat dan menghindari rintangan.
                    </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <h3 className="font-semibold text-orange-800 text-sm mb-1">💛 Kumpulkan</h3>
                    <p className="text-xs text-orange-600">
                        Hati, bintang, dan bunga lotus memberikan poin bonus. Combo = lebih banyak poin!
                    </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <h3 className="font-semibold text-green-800 text-sm mb-1">✨ Tips</h3>
                    <p className="text-xs text-green-600">
                        Game ini juga tersedia saat offline. Mainkan kapan saja untuk relaksasi sejenak.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
