"use client";

import { useState } from "react";
import { Wind, Play, BarChart3, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

interface BreathingTutorialProps {
    isOpen: boolean;
    onComplete: () => void;
}

const TUTORIAL_STEPS = [
    {
        icon: <Wind className="w-12 h-12 text-primary" />,
        title: "Selamat Datang! 🧘",
        description: "Latihan pernapasan membantu menenangkan pikiran dan mengurangi stres. Mari kita mulai perjalananmu.",
        tips: ["Pilih teknik yang sesuai dengan kebutuhanmu", "Mulai dari durasi pendek (2-5 menit)", "Latihan rutin lebih efektif dari sesi panjang jarang"],
    },
    {
        icon: <Play className="w-12 h-12 text-green-500" />,
        title: "Memulai Sesi",
        description: "Pilih teknik, atur durasi, lalu ikuti petunjuk visual dan suara.",
        tips: ["Duduk dengan nyaman dan tutup mata jika memungkinkan", "Ikuti lingkaran animasi - tarik napas saat membesar, hembuskan saat mengecil", "Gunakan mood selector untuk melacak perasaanmu sebelum dan sesudah"],
    },
    {
        icon: <BarChart3 className="w-12 h-12 text-purple-500" />,
        title: "Lacak Progresmu",
        description: "Lihat statistik, kalender heatmap, dan raih streak harian.",
        tips: ["Klik ikon statistik di header untuk melihat progres", "Pertahankan streak harian untuk bonus XP", "7 hari berturut-turut = 50 XP bonus!"],
    },
    {
        icon: <Heart className="w-12 h-12 text-red-500" />,
        title: "Tips Penting",
        description: "Keselamatan dan kenyamananmu yang utama.",
        tips: ["Hentikan jika merasa pusing atau tidak nyaman", "Jangan memaksakan diri - pilih durasi yang nyaman", "Naikkan durasi secara bertahap saat merasa siap"],
    },
];

export function BreathingTutorial({ isOpen, onComplete }: BreathingTutorialProps) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const currentStep = TUTORIAL_STEPS[step];
    const isLast = step === TUTORIAL_STEPS.length - 1;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Progress Bar */}
                <div className="flex gap-1 p-3">
                    {TUTORIAL_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-colors",
                                i <= step ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>

                {/* Skip button */}
                <div className="flex justify-end px-4">
                    <button
                        onClick={onComplete}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Lewati
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 pt-2 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            {currentStep.icon}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{currentStep.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{currentStep.description}</p>

                    <div className="text-left space-y-2 mb-6 bg-muted/50 rounded-lg p-4">
                        {currentStep.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-primary font-bold text-sm mt-0.5">✦</span>
                                <span className="text-sm">{tip}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (isLast) {
                                onComplete();
                            } else {
                                setStep((s) => s + 1);
                            }
                        }}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        {isLast ? "Mulai Berlatih!" : "Lanjut"}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
