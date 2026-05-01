import Link from "next/link";
import { ArrowRight, Building2, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const contactChannels = [
  {
    title: "Kemitraan Kampus & Perusahaan",
    description: "Diskusikan kebutuhan seat B2B, analytics organisasi, dan onboarding anggota.",
    value: "business@ruangtenang.id",
    href: "mailto:business@ruangtenang.id",
    icon: Building2,
  },
  {
    title: "Dukungan Pengguna",
    description: "Bantuan akun, billing, konten, dan kendala teknis aplikasi.",
    value: "halo@ruangtenang.id",
    href: "mailto:halo@ruangtenang.id",
    icon: Mail,
  },
  {
    title: "Kontak Cepat",
    description: "Untuk koordinasi demo, aktivasi mitra, atau follow-up pembayaran.",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
    icon: Phone,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-b from-red-50/50 via-white to-background">
      <Navbar variant="back" backHref={ROUTES.HOME} backLabel="Kembali ke Beranda" />

      <main className="pt-28 pb-16">
        <section className="px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Tim Ruang Tenang
                </p>
                <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-gray-950 md:text-5xl">
                  Hubungi kami untuk dukungan pengguna dan kebutuhan B2B.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
                  Pilih kanal yang sesuai agar tim kami bisa merespons konteksmu dengan cepat, baik untuk akun personal,
                  billing, maupun implementasi organisasi.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                    <a href="mailto:business@ruangtenang.id">
                      Bicara dengan Tim Bisnis
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                    <Link href={ROUTES.REGISTER}>
                      Mulai sebagai Pengguna
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <aside className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">Informasi yang membantu</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      Sertakan nama organisasi, jumlah seat, kebutuhan analytics, dan timeline aktivasi jika menghubungi
                      kami untuk implementasi mitra.
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50/40 p-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Universitas Teknologi Yogyakarta, Daerah Istimewa Yogyakarta</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="px-4 mt-10">
          <div className="container mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {contactChannels.map((channel) => (
              <a
                key={channel.title}
                href={channel.href}
                className="group rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <channel.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-gray-950">{channel.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{channel.description}</p>
                <p className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-primary">
                  {channel.value}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
