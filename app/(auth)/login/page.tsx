"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { AuthIllustration, AuthMascotMini } from "@/components/shared/auth/AuthIllustration";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { toast } from "sonner";
import { buildPathWithRedirect, getSafeRedirect } from "@/lib/safe-redirect";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const REGISTERED_TOAST_KEY = "registered-login-toast-shown";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const redirectTarget = getSafeRedirect(searchParams.get("redirect"), ROUTES.DASHBOARD);
  const registerHref = buildPathWithRedirect(ROUTES.REGISTER, redirectTarget);

  useEffect(() => {
    const isRegistered = searchParams.get("registered") === "1";

    if (!isRegistered) {
      sessionStorage.removeItem(REGISTERED_TOAST_KEY);
      return;
    }

    const hasShownToast = sessionStorage.getItem(REGISTERED_TOAST_KEY) === "1";
    if (!hasShownToast) {
      sessionStorage.setItem(REGISTERED_TOAST_KEY, "1");
      toast.success("Registrasi berhasil! Silakan login.");
    }

    router.replace(buildPathWithRedirect(ROUTES.LOGIN, searchParams.get("redirect")));
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password, rememberMe);
      router.push(redirectTarget);
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Login gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="auth-page flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="auth-form-content w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
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
            <AuthMascotMini pose="welcome" />
            <h1 className="mb-2 text-3xl font-bold">Selamat datang kembali</h1>
            <p className="text-gray-500">Masukkan detail akunmu untuk masuk.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">Ingat Aku</span>
              </label>
              <Link href={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
                Lupa Password?
              </Link>
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
                "Login"
              )}
            </Button>

            {/* Register Link */}
            <p className="text-center text-gray-600">
              Tidak punya Akun?{" "}
              <Link href={registerHref} className="text-primary font-medium hover:underline">
                Registrasi disini
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <AuthIllustration
        title="Ada ruang untukmu di sini"
        description="Masuk dan lanjutkan langkah kecilmu bersama Ruang Tenang. Bulan Pulih siap menemanimu, pelan-pelan."
        pose="welcome"
      />

      <PWAInstallPrompt />
    </div>
  );
}
