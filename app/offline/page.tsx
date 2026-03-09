import type { Metadata } from "next";
import MindfulRunnerGame from "@/components/game/MindfulRunnerGame";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
    title: "Offline - Ruang Tenang",
};

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-red-50 to-white flex flex-col items-center justify-center p-4">
            <div className="max-w-3xl w-full text-center space-y-6">
                {/* Offline notice */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <WifiOff className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Kamu Sedang Offline
                    </h1>
                    <p className="text-gray-500 max-w-md">
                        Sepertinya koneksi internetmu sedang terputus. Sambil menunggu, yuk mainkan game ini untuk menenangkan pikiran 🧘
                    </p>
                </div>

                {/* Game */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
                    <MindfulRunnerGame />
                </div>

                {/* Tips section */}
                <div className="bg-white/80 rounded-xl p-5 border border-red-100 text-left max-w-md mx-auto">
                    <h3 className="font-semibold text-gray-800 mb-2">
                        💡 Tips saat offline:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                        <li>• Tarik napas dalam selama 4 detik, tahan 4 detik, hembuskan 4 detik</li>
                        <li>• Perhatikan 5 hal yang bisa kamu lihat di sekitarmu</li>
                        <li>• Tulis 3 hal yang kamu syukuri hari ini</li>
                        <li>• Regangkan tubuhmu dan berdiri sejenak</li>
                    </ul>
                </div>

                <p className="text-xs text-gray-400">
                    Koneksi akan otomatis terhubung kembali saat internet tersedia
                </p>
            </div>
        </div>
    );
}
