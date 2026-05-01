"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { buildPathWithRedirect } from "@/lib/safe-redirect";
import { b2bService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { B2BInvitePreview } from "@/types";
import { toast } from "sonner";

export function B2BInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token") ?? "";
  const { token, isAuthenticated, isHydrated, user } = useAuthStore();
  const [preview, setPreview] = useState<B2BInvitePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inviteRedirect = invitationToken
    ? `/b2b/invite?${new URLSearchParams({ token: invitationToken }).toString()}`
    : "/b2b/invite";
  const loginHref = buildPathWithRedirect(ROUTES.LOGIN, inviteRedirect);
  const registerHref = buildPathWithRedirect(ROUTES.REGISTER, inviteRedirect);

  const loadPreview = useCallback(async () => {
    if (!isHydrated) return;
    if (!invitationToken || !token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await b2bService.getInvitePreview(token, invitationToken);
      setPreview(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat undangan.");
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, invitationToken, token]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const acceptInvite = async () => {
    if (!token || !invitationToken) return;
    setIsAccepting(true);
    try {
      await b2bService.acceptInvite(token, invitationToken);
      toast.success("Undangan organisasi berhasil diterima.");
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menerima undangan.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (!invitationToken) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Link undangan tidak valid</h1>
          <p className="mt-2 text-sm text-gray-600">Token undangan tidak ditemukan.</p>
        </section>
      </main>
    );
  }

  if (!isHydrated || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </main>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <Building2 className="mx-auto h-10 w-10 text-sky-600" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Masuk untuk menerima undangan</h1>
          <p className="mt-2 text-sm text-gray-600">Gunakan akun dengan email yang sama dengan undangan organisasi.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href={loginHref}>
              <Button>Masuk</Button>
            </Link>
            <Link href={registerHref}>
              <Button variant="outline">Daftar</Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Undangan organisasi B2B</p>
            <h1 className="text-xl font-semibold text-gray-900">{preview?.organization.name ?? "Organisasi"}</h1>
            <p className="mt-1 text-sm text-gray-600">Login sebagai {user?.email}</p>
          </div>
        </div>

        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        {preview && (
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900">{preview.full_name || preview.email}</p>
              <p className="text-gray-600">{preview.email}</p>
              <p className="mt-2 text-xs text-gray-500">Role organisasi: {preview.role}</p>
            </div>
            {!preview.can_accept && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                {preview.message || "Undangan belum bisa diterima."}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Link href={ROUTES.DASHBOARD}>
            <Button variant="outline">Kembali</Button>
          </Link>
          <Button onClick={acceptInvite} disabled={!preview?.can_accept || isAccepting}>
            {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Terima Undangan
          </Button>
        </div>
      </section>
    </main>
  );
}
