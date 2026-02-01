"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { AuthIllustration } from "@/components/auth/AuthIllustration";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

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
      router.push("/dashboard");
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Login gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo-full.png"
                alt="Ruang Tenang"
                width={180}
                height={60}
                className="object-contain"
              />
            </Link>
            <p className="text-gray-500">Masukan detail Anda untuk Login</p>
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
                  placeholder="Richard@email.com"
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
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
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
              <Link href="/register" className="text-primary font-medium hover:underline">
                Registrasi disini
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Illustration */}
      {/* Right Side - Illustration */}
      <AuthIllustration 
        title="RuangTenang"
        description="RuangTenang adalah platform konsultasi berbasis AI yang dirancang untuk membantu mahasiswa menghadapi tantangan kesehatan mental dalam dunia akademik. Melalui interaksi percakapan yang empatik, RuangTenang hadir sebagai teman virtual yang siap mendengarkan."
      />
    </div>
  );
}
