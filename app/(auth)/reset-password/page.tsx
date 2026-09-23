"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { AuthIllustration, AuthMascotMini } from "@/components/shared/auth/AuthIllustration";
import { useResetPassword } from "./_hooks/useResetPassword";

function ResetPasswordForm() {
  const {
    token,
    isSuccess,
    isLoading,
    error,
    showPassword,
    showConfirmPassword,
    errors,
    register,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
  } = useResetPassword();

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 p-4 rounded-xl text-red-600 mb-6">
          Link tidak valid. Pastikan Anda menggunakan link yang benar dari email Anda.
        </div>
        <Link href={ROUTES.FORGOT_PASSWORD}>
          <Button variant="outline">Kirim Ulang Link</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Password Berhasil Direset!</h2>
          <p className="text-gray-500 mt-2">Anda akan dialihkan ke halaman login sejenak lagi...</p>
        </div>
        <Link href={ROUTES.LOGIN}>
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl">
            Login Sekarang
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            className="pl-4 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">Password Baru</Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 6 karakter"
            className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Konfirmasi Password</Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Ulangi password baru"
            className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
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
          "Reset Password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page flex min-h-screen">
      {/* Left Side */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="auth-form-content w-full max-w-md">
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
            <AuthMascotMini pose="key" />
            <h1 className="text-2xl font-bold mb-2">Buat Password Baru</h1>
            <p className="text-gray-500">
              Masukkan password baru untuk akun Anda.
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      {/* Right Side */}
      <AuthIllustration
        title="Pintu baru terbuka"
        description="Buat password yang kuat dan unik. Setelah ini, perjalananmu bisa berlanjut dengan nyaman."
        pose="key"
      />
    </div>
  );
}
