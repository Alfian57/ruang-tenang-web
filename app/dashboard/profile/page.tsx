"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  whatsapp_number: z.string().regex(/^(?:\+62|62|0)8\d{8,13}$/, "Nomor WhatsApp Indonesia tidak valid"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      whatsapp_number: user?.whatsapp_number || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!token) return;
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      await authService.updateProfile(token, { name: data.name, email: data.email, whatsapp_number: data.whatsapp_number });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      const err = error as Error;
      setProfileError(err.message || "Gagal memperbarui profil");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!token) return;
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await authService.updatePassword(token, {
        old_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword
      });
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      const err = error as Error;
      setPasswordError(err.message || "Gagal memperbarui password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="py-4 lg:py-6">
      <DashboardMascotHero eyebrow="Ruang milikmu" title="Profil" description="Kelola informasi pribadi dan keamanan akunmu dengan tenang." image="/images/landing/mascot/secure.webp" imageAlt="RuNa menjaga keamanan profil" />

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informasi Profil
          </CardTitle>
          <CardDescription>
            Perbarui nama, email, dan nomor WhatsApp akunmu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            {profileError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Profil berhasil diperbarui. Jika nomor berubah, verifikasi diperlukan saat login berikutnya.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...profileForm.register("email")} />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">Nomor WhatsApp untuk reset kata sandi</Label>
              <Input id="whatsapp_number" type="tel" autoComplete="tel" placeholder="081234567890" {...profileForm.register("whatsapp_number")} />
              {profileForm.formState.errors.whatsapp_number && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.whatsapp_number.message}</p>
              )}
            </div>
            <Button type="submit" disabled={profileLoading} className="gradient-primary border-0">
              {profileLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Ubah Password
          </CardTitle>
          <CardDescription>
            Perbarui password akunmu untuk keamanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Password berhasil diperbarui
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Lama</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
