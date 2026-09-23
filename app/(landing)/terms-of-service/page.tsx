import { Navbar, Footer } from "@/components/layout";
import { ROUTES } from "@/lib/routes";
import { FileText, Shield, AlertTriangle, Ban, Mail } from "lucide-react";
import { PublicPageHero } from "../_components/PublicPageHero";

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
        <div className="public-page">
            <Navbar variant="back" backHref={ROUTES.HOME} backLabel="Kembali ke Beranda" />

            <main className="pt-28 pb-16">
                <section className="px-4">
                    <div className="container mx-auto max-w-4xl">
                        <PublicPageHero compact eyebrow="Syarat Layanan" title={<>Syarat dan Ketentuan Penggunaan <span>Ruang Tenang</span></>} description="Dokumen ini mengatur hak, kewajiban, dan batas tanggung jawab antara pengguna dan Ruang Tenang. Mohon baca dengan saksama sebelum menggunakan layanan." pose="secure"><span className="text-sm text-slate-500">Terakhir diperbarui: 20 Februari 2026</span></PublicPageHero>
                    </div>
                </section>

                <section className="px-4 mt-10">
                    <div className="container mx-auto max-w-4xl space-y-6">
                        {sections.map((section) => (
                            <article
                                key={section.title}
                                className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-7"
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
                        <div className="flex items-start gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm md:p-8">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
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

            <Footer variant="landing" />
        </div>
    );
}
