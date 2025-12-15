"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini harus diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!token) return;

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.updatePassword(token, data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError((err as Error).message || "Gagal mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError("");
    setSuccess(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ganti Password</DialogTitle>
          <DialogDescription>
            Masukkan password saat ini dan password baru Anda.
          </DialogDescription>
        </DialogHeader>

        <form id="password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              {...register("currentPassword")} 
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input 
              id="newPassword" 
              type="password" 
              {...register("newPassword")} 
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...register("confirmPassword")} 
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm text-center">
              Password berhasil diubah!
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" form="password-form" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
