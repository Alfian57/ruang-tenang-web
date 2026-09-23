"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/api";
import { AuthIllustration, AuthMascotMini } from "@/components/shared/auth/AuthIllustration";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Gagal mengirim permintaan reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page flex min-h-screen">
      {/* Left Side */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="auth-form-content w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo-full.webp"
                alt="Ruang Tenang"
                width={180}
                height={60}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <AuthMascotMini pose="secure" />
            <h1 className="text-2xl font-bold mb-2">Lupa Password?</h1>
            <p className="text-gray-500">
              {isSubmitted
                ? "Silakan cek email Anda untuk instruksi selanjutnya."
                : "Masukkan email Anda untuk mereset password."}
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-green-700 text-sm">
                Jika email terdaftar, kami telah mengirimkan link reset password.
              </div>
              <Link href="/login">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                    {...register("email")}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <AuthIllustration
        title="Tenang, kita bantu"
        description="Kirim permintaan reset melalui email. Bulan Pulih menjaga langkahmu sampai kamu bisa kembali masuk."
        pose="secure"
      />
    </div>
  );
}
