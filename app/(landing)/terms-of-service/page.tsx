import { Navbar, Footer } from "@/components/layout";
import { FileText, Shield, AlertTriangle, Ban, Mail } from "lucide-react";

const sections = [
    {
        title: "1. Penerimaan Ketentuan",
        icon: FileText,
        points: [
            "Dengan mengakses dan menggunakan Ruang Tenang, kamu menyetujui seluruh syarat dan ketentuan pada halaman ini.",
            "Jika kamu tidak menyetujui ketentuan ini, mohon untuk tidak melanjutkan penggunaan layanan.",
        ],
    },
    {
        title: "2. Ruang Lingkup Layanan",
        icon: Shield,
        points: [
            "Ruang Tenang adalah platform pendamping kesehatan mental berbasis teknologi untuk dukungan harian.",
            "Layanan ini tidak dimaksudkan sebagai pengganti diagnosis, terapi, atau tindakan medis profesional.",
            "Dalam kondisi darurat atau krisis, segera hubungi layanan kesehatan atau pihak berwenang terdekat.",
        ],
    },
    {
        title: "3. Kewajiban Pengguna",
        icon: AlertTriangle,
        points: [
            "Menggunakan layanan secara bertanggung jawab dan tidak menyalahgunakan fitur yang tersedia.",
            "Tidak mengunggah konten yang melanggar hukum, mengandung kebencian, pelecehan, atau merugikan pihak lain.",
            "Menjaga kerahasiaan akun dan kata sandi serta bertanggung jawab atas aktivitas di akunmu.",
        ],
    },
    {
        title: "4. Pembatasan Tanggung Jawab",
        icon: Ban,
        points: [
            "Ruang Tenang berupaya menyediakan layanan terbaik, namun tidak menjamin layanan bebas gangguan setiap saat.",
            "Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan di luar kendali wajar kami.",
            "Kami berhak melakukan perubahan fitur atau pembaruan syarat layanan sewaktu-waktu dengan pemberitahuan yang wajar.",
        ],
    },
];

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar variant="back" backHref="/" backLabel="Kembali ke Beranda" />

            <main className="pt-28 pb-16">
                <section className="px-4">
                    <div className="container mx-auto max-w-4xl">
                        <div className="rounded-3xl border border-primary/10 bg-linear-to-br from-red-50 via-orange-50 to-amber-50 p-8 md:p-12 shadow-sm">
                            <p className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-primary mb-5">
                                Syarat Layanan
                            </p>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                                Syarat dan Ketentuan Penggunaan Ruang Tenang
                            </h1>
                            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl">
                                Dokumen ini mengatur hak, kewajiban, dan batas tanggung jawab antara pengguna dan Ruang Tenang.
                                Mohon baca dengan saksama sebelum menggunakan layanan.
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
                                <h3 className="text-lg font-semibold text-gray-900">Kontak terkait syarat layanan</h3>
                                <p className="text-gray-600 mt-2 leading-relaxed">
                                    Untuk pertanyaan terkait syarat penggunaan, silakan hubungi kami melalui email di
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
