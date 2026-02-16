"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

export function useResetPassword() {
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

  return {
    token,
    isSuccess,
    isLoading,
    error,
    showPassword,
    showConfirmPassword,
    errors,
    register,
    handleSubmit: handleSubmit(onSubmit),
    setShowPassword,
    setShowConfirmPassword,
  };
}
