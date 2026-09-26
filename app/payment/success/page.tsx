import { Metadata } from "next";
import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pembayaran sedang diverifikasi | Ruang Tenang",
  description: "Duitku sedang mengirim konfirmasi pembayaran ke Ruang Tenang.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-blue-100 dark:border-blue-900/30">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Clock3 className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Pembayaran sedang diverifikasi
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Duitku sedang mengirim konfirmasi ke Ruang Tenang. Status transaksi akan diperbarui setelah callback pembayaran diterima.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Silakan kembali ke aplikasi mobile Ruang Tenang untuk menikmati layanan premium atau menggunakan koin Anda.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-4">
          {/* We can provide a deep link or simply ask them to return */}
          <p className="text-xs text-center text-slate-400 mb-2">
            Anda sudah bisa menutup halaman ini.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/">
              Kembali ke Beranda Web <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
