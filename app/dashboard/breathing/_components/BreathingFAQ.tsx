"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/utils";

const FAQ_ITEMS = [
    {
        question: "Apa manfaat latihan pernapasan?",
        answer: "Latihan pernapasan membantu menurunkan tingkat stres, mengurangi kecemasan, meningkatkan fokus, memperbaiki kualitas tidur, dan meningkatkan kesejahteraan mental secara umum. Teknik pernapasan yang tepat juga dapat membantu mengatur detak jantung dan tekanan darah.",
    },
    {
        question: "Berapa lama sebaiknya saya berlatih?",
        answer: "Mulailah dengan 2-5 menit per sesi, lalu secara bertahap naikkan ke 10-15 menit. Konsistensi lebih penting daripada durasi - berlatih 5 menit setiap hari lebih baik dari 30 menit sekali seminggu.",
    },
    {
        question: "Teknik mana yang cocok untuk pemula?",
        answer: "Box Breathing (4-4-4-4) adalah teknik terbaik untuk pemula karena polanya sederhana dan seimbang. Coherent Breathing (5-5) juga sangat baik karena hanya fokus pada tarik dan hembuskan tanpa menahan napas.",
    },
    {
        question: "Kapan waktu terbaik untuk berlatih?",
        answer: "Pagi hari setelah bangun tidur sangat baik untuk memulai hari dengan tenang. Sebelum tidur, gunakan teknik 4-7-8 untuk membantu relaksasi. Kamu juga bisa berlatih kapan saja saat merasa stres atau cemas.",
    },
    {
        question: "Apakah ada efek samping?",
        answer: "Latihan pernapasan umumnya aman. Namun, jika kamu merasa pusing, mual, atau tidak nyaman, hentikan latihan dan bernapaslah secara normal. Jangan memaksakan diri dan konsultasikan dengan dokter jika kamu memiliki kondisi pernapasan tertentu.",
    },
    {
        question: "Bagaimana cara kerja streak?",
        answer: "Streak dihitung berdasarkan hari berturut-turut kamu menyelesaikan sesi pernapasan. Setiap hari kamu berlatih, streak bertambah 1. Jika melewatkan satu hari, streak kembali ke 0. Raih 7 hari streak untuk 50 XP bonus dan 30 hari untuk 200 XP bonus!",
    },
    {
        question: "Bisakah saya membuat teknik sendiri?",
        answer: "Ya! Kamu bisa membuat teknik pernapasan kustom dengan mengatur durasi tarik napas, tahan, hembuskan, dan tahan setelah hembuskan. Teknik kustom akan tersimpan di akunmu dan bisa kamu favorit-kan.",
    },
];

export function BreathingFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Pertanyaan Umum</h3>
            </div>
            {FAQ_ITEMS.map((item, index) => (
                <div
                    key={index}
                    className="border rounded-xl overflow-hidden transition-colors hover:border-primary/30"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <span className="font-medium text-sm pr-4">{item.question}</span>
                        <ChevronDown
                            className={cn(
                                "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                                openIndex === index && "rotate-180"
                            )}
                        />
                    </button>
                    {openIndex === index && (
                        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t pt-3 bg-muted/30">
                            {item.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
