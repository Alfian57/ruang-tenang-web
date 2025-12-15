"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

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
  const { register: registerUser, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data.name, data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo-full.png"
                alt="Ruang Tenang"
                width={180}
                height={60}
                className="object-contain"
              />
            </Link>
            <p className="text-gray-500">Buat akun baru untuk memulai</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm">
                Registrasi berhasil! Mengalihkan ke halaman login...
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••"
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

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-semibold"
              disabled={isLoading || success}
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
              <Link href="/login" className="text-primary font-medium hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-red-400 via-red-500 to-red-600">
          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 left-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <h2 className="text-4xl font-bold mb-6">RuangTenang</h2>
          <p className="text-center text-white/90 max-w-lg leading-relaxed mb-10">
            Bergabunglah dengan ribuan mahasiswa yang telah menemukan ketenangan dalam 
            menghadapi tekanan akademik. Platform kami hadir untuk membantu Anda mengelola 
            stres, memahami emosi, dan menemukan keseimbangan dalam hidup.
          </p>

          {/* Illustration */}
          <div className="relative">
            <Image
              src="/images/landing/about-doctor.png"
              alt="RuangTenang App"
              width={350}
              height={450}
              className="object-contain drop-shadow-2xl"
            />
            
            {/* Floating icons */}
            <div className="absolute top-0 right-0 bg-white rounded-full p-3 shadow-lg">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="absolute bottom-20 -left-4 bg-white rounded-full p-3 shadow-lg">
              <span className="text-2xl">🩺</span>
            </div>
            <div className="absolute top-1/2 -right-4 bg-white rounded-full p-3 shadow-lg">
              <span className="text-2xl">💊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
