"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/api";
import { ROUTES } from "@/lib/routes";

const resetPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Token reset password tidak valid atau hilang.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: data.email,
        token: token,
        password: data.password,
        password_confirmation: data.confirmPassword
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Gagal mereset password. Token mungkin sudah kedaluwarsa.");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href={ROUTES.HOME} className="inline-block mb-6">
              <Image
                src="/logo-full.png"
                alt="Ruang Tenang"
                width={180}
                height={60}
                className="object-contain"
              />
            </Link>
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
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-linear-to-br from-red-400 via-red-500 to-red-600">
         <div className="absolute inset-0 bg-linear-to-br from-red-400 via-red-500 to-red-600">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 left-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
           <div className="relative mb-8">
            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CheckCircle className="w-32 h-32 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Mulai Lembaran Baru</h2>
          <p className="text-center text-white/90 max-w-md">
            Pastikan password baru Anda kuat dan unik untuk menjaga keamanan akun Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
