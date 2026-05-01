"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { AuthIllustration } from "@/components/shared/auth/AuthIllustration";
import { buildPathWithRedirect, getSafeRedirect } from "@/lib/safe-redirect";
import { TRUST_CUES } from "@/constants";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const redirectTarget = getSafeRedirect(searchParams.get("redirect"), "");
  const loginHref = buildPathWithRedirect(ROUTES.LOGIN, redirectTarget);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data.name, data.email, data.password, data.confirmPassword);
      const loginParams = new URLSearchParams({ registered: "1" });
      if (redirectTarget) {
        loginParams.set("redirect", redirectTarget);
      }
      router.push(`${ROUTES.LOGIN}?${loginParams.toString()}`);
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Registrasi gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={ROUTES.HOME} className="inline-block mb-6">
              <Image
                src="/logo-full.webp"
                alt="Ruang Tenang"
                width={180}
                height={60}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <p className="text-gray-500">Buat akun baru untuk memulai</p>
          </div>

          <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-900">
                  Privasi & Batasan AI
                </p>
                <p className="mt-1 text-xs leading-relaxed text-sky-800">{TRUST_CUES.COMBINED}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Nama Lengkap</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  {...register("name")}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  {...register("password")}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  {...register("confirmPassword")}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
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
                "Daftar"
              )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Sudah punya akun?{" "}
              <Link href={loginHref} className="text-primary font-medium hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <AuthIllustration
        title="RuangTenang"
        description="Bergabunglah dengan ribuan mahasiswa yang telah menemukan ketenangan dalam menghadapi tekanan akademik. Platform kami hadir untuk membantu Anda mengelola stres, memahami emosi, dan menemukan keseimbangan dalam hidup."
      />
    </div>
  );
}
