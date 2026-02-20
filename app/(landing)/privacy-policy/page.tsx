import { Navbar, Footer } from "@/components/layout";
import { ShieldCheck, Lock, Database, UserCheck, Mail } from "lucide-react";

const sections = [
    {
        title: "1. Informasi yang Kami Kumpulkan",
        icon: Database,
        points: [
            "Informasi akun seperti nama, email, dan kata sandi terenkripsi saat kamu mendaftar.",
            "Data penggunaan fitur seperti riwayat aktivitas, mood tracking, serta interaksi fitur untuk meningkatkan kualitas layanan.",
            "Konten yang kamu kirimkan (misalnya jurnal, forum, atau percakapan) diproses seperlunya untuk memberikan pengalaman yang lebih personal.",
        ],
    },
    {
        title: "2. Cara Kami Menggunakan Data",
        icon: UserCheck,
        points: [
            "Menyediakan layanan utama Ruang Tenang sesuai kebutuhanmu.",
            "Meningkatkan performa, keamanan, dan kenyamanan produk.",
            "Mengirimkan informasi penting terkait akun, pembaruan fitur, atau notifikasi keamanan.",
        ],
    },
    {
        title: "3. Keamanan dan Perlindungan",
        icon: Lock,
        points: [
            "Kami menerapkan kontrol keamanan teknis dan prosedural untuk melindungi data pengguna.",
            "Akses data dibatasi hanya untuk pihak internal yang memang membutuhkan.",
            "Kami tidak menjual data pribadi kamu kepada pihak ketiga.",
        ],
    },
    {
        title: "4. Hak Pengguna",
        icon: ShieldCheck,
        points: [
            "Kamu berhak meminta akses, pembaruan, atau penghapusan data pribadi tertentu sesuai ketentuan yang berlaku.",
            "Kamu dapat mengelola preferensi notifikasi dan informasi akun melalui pengaturan profil.",
            "Kamu dapat berhenti menggunakan layanan kapan saja melalui penghapusan akun.",
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar variant="back" backHref="/" backLabel="Kembali ke Beranda" />

            <main className="pt-28 pb-16">
                <section className="px-4">
                    <div className="container mx-auto max-w-4xl">
                        <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-orange-50 to-amber-50 p-8 md:p-12 shadow-sm">
                            <p className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-primary mb-5">
                                Kebijakan Privasi
                            </p>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                                Privasi Kamu adalah Prioritas Kami
                            </h1>
                            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl">
                                Di Ruang Tenang, kami berkomitmen untuk menjaga kerahasiaan data dan kenyamananmu saat menggunakan platform.
                                Kebijakan ini menjelaskan bagaimana informasi dikumpulkan, digunakan, dan dilindungi.
                            </p>
                            <p className="text-sm text-gray-500 mt-6">Terakhir diperbarui: 20 Februari 2026</p>
                        </div>
                    </div>
                </section>

                <section className="px-4 mt-10">
                    <div className="container mx-auto max-w-4xl space-y-6">
                        {sections.map((section) => (
                            <article
                                key={section.title}
                                className="rounded-2xl border border-gray-100 bg-white p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 leading-snug">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.points.map((point) => (
                                        <li key={point} className="text-gray-600 leading-relaxed flex gap-3">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="px-4 mt-10">
                    <div className="container mx-auto max-w-4xl">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pertanyaan terkait privasi</h3>
                                <p className="text-gray-600 mt-2 leading-relaxed">
                                    Jika kamu memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui email di
                                    <span className="font-medium text-gray-800"> halo@ruangtenang.id</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
