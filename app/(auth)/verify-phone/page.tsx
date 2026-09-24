"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { authService } from "@/services/api/auth";
import { useAuthStore } from "@/store/authStore";
import type { PhoneVerificationChallenge } from "@/services/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPhonePage() {
  const router = useRouter();
  const verifyPhone = useAuthStore((state) => state.verifyPhone);
  const [challenge, setChallenge] = useState<PhoneVerificationChallenge | null>(null);
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("phone-verification");
    if (!saved) { router.replace(ROUTES.LOGIN); return; }
    try {
      const parsed = JSON.parse(saved) as PhoneVerificationChallenge;
      if (!parsed.verification_token) throw new Error("missing token");
      setChallenge(parsed);
    } catch { router.replace(ROUTES.LOGIN); }
  }, [router]);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    if (!/^(?:\+62|62|0)8\d{8,13}$/.test(number)) { setError("Nomor WhatsApp Indonesia tidak valid"); return; }
    setBusy(true); setError("");
    try {
      await authService.setVerificationPhone(challenge.verification_token, number);
      const next = { ...challenge, phone_required: false };
      sessionStorage.setItem("phone-verification", JSON.stringify(next));
      setChallenge(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gagal mengirim kode"); }
    finally { setBusy(false); }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    if (!/^\d{6}$/.test(code)) { setError("Masukkan 6 digit kode OTP"); return; }
    setBusy(true); setError("");
    try {
      await verifyPhone(challenge.verification_token, code);
      sessionStorage.removeItem("phone-verification");
      const destination = getSafeRedirect(sessionStorage.getItem("phone-verification-redirect"), ROUTES.DASHBOARD);
      sessionStorage.removeItem("phone-verification-redirect");
      router.replace(destination);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kode OTP tidak valid"); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-page flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg space-y-5">
        <h1 className="text-2xl font-bold">Verifikasi WhatsApp</h1>
        <p className="text-sm text-gray-600">Masukkan kode 6 digit yang dikirim ke nomor WhatsApp akunmu. Kode berlaku 10 menit.</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {challenge?.phone_required ? (
          <form onSubmit={sendCode} className="space-y-4">
            <p className="text-sm text-gray-600">Akunmu belum memiliki nomor WhatsApp. Tambahkan nomor untuk menerima kode.</p>
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input id="phone" type="tel" autoComplete="tel" placeholder="081234567890" value={number} onChange={(event) => setNumber(event.target.value)} required />
            <Button type="submit" disabled={busy} className="w-full">Kirim kode</Button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-4">
            <Label htmlFor="code">Kode OTP</Label>
            <Input id="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required />
            <Button type="submit" disabled={busy} className="w-full">Verifikasi dan masuk</Button>
          </form>
        )}
        <Link href={ROUTES.LOGIN} className="block text-center text-sm text-primary">Kembali ke login untuk meminta kode baru</Link>
      </div>
    </main>
  );
}
