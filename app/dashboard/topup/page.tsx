"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Coins, Crown, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useBillingCheckout } from "@/hooks/useBillingCheckout";
import { useAuthStore } from "@/store/authStore";
import { billingService } from "@/services/api";
import type {
    BillingCatalog,
    BillingStatus,
    BillingTopupPackage,
} from "@/types";

const IDR_FORMATTER = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatIDR(amount: number): string {
    return IDR_FORMATTER.format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value?: string): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatPremiumAccess(status: BillingStatus | null): string {
    if (!status?.is_premium) return "-";
    if (status.entitlement_source === "b2b") {
        return status.b2b_organization_id ? `B2B #${status.b2b_organization_id}` : "B2B organisasi";
    }
    return formatDate(status.premium_expires_at);
}

export default function TopupPage() {
    const { token, user, refreshUser } = useAuthStore();
    const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        if (!token) {
            setCatalog(null);
            setStatus(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [catalogRes, statusRes] = await Promise.all([
                billingService.getCatalog(token),
                billingService.getStatus(token),
            ]);
            setCatalog(catalogRes.data);
            setStatus(statusRes.data);
        } catch {
            toast.error("Gagal memuat data billing", {
                description: "Silakan muat ulang halaman.",
            });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void refreshData();
    }, [refreshData]);

    const { processingKey, runCheckout } = useBillingCheckout({
        token,
        onRefresh: refreshData,
        refreshUser,
    });

    const topupPackages = catalog?.topup_packages ?? [];

    const recommendedPlan = useMemo(() => {
        const plans = catalog?.plans ?? [];
        if (plans.length === 0) return null;
        return [...plans].sort((a, b) => a.price - b.price)[0];
    }, [catalog?.plans]);

    const recommendedBusinessPlan = useMemo(() => {
        const businessPlans = catalog?.business_plans ?? [];
        if (businessPlans.length === 0) return null;
        return [...businessPlans].sort((a, b) => Number(a.base_price_per_seat ?? 0) - Number(b.base_price_per_seat ?? 0))[0];
    }, [catalog?.business_plans]);

    const currentTier = useMemo(() => {
        if (user?.role === "mitra") return "Bisnis";
        if (status?.entitlement_source === "b2b") return "Premium B2B";
        if (status?.is_premium) return "Premium";
        return "Gratis";
    }, [status?.entitlement_source, status?.is_premium, user?.role]);

    const quota = status?.chat_quota ?? catalog?.chat_quota;
    const quotaLabel = quota?.is_unlimited
        ? "Tanpa batas"
        : `${Math.max(0, quota?.remaining ?? 0)} sisa dari ${quota?.limit ?? 0}`;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <section className="rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-cyan-50 p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Top Up Koin</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Tambah Koin untuk Reward</h1>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                            Fokus halaman ini adalah saldo koin. Upgrade premium dan B2B dikelola dari halaman Billing agar pilihan paket tetap jelas.
                        </p>
                    </div>
                    <Link href={ROUTES.BILLING}>
                        <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-100">
                            Buka Billing Detail
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Saldo Koin</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{(status?.gold_coins ?? user?.gold_coins ?? 0).toLocaleString("id-ID")}</p>
                        <p className="mt-1 text-xs text-slate-500">Bisa dipakai untuk klaim reward</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Tier Aktif</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{currentTier}</p>
                        <p className="mt-1 text-xs text-slate-500">Akses: {formatPremiumAccess(status)}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Kuota Chat AI</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{quotaLabel}</p>
                        <p className="mt-1 text-xs text-slate-500">Reset: {formatDate(quota?.reset_at)}</p>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Paket Top Up Koin</h2>
                </div>

                {topupPackages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Paket top up belum tersedia</p>
                        <p className="mt-1">Coba muat ulang katalog atau buka Billing untuk melihat opsi premium yang aktif.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => void refreshData()}>
                                Muat Ulang
                            </Button>
                            <Link href={ROUTES.BILLING}>
                                <Button type="button" size="sm">
                                    Buka Billing
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {topupPackages.map((pkg: BillingTopupPackage) => {
                            const isProcessing = processingKey === `topup-${pkg.id}`;
                            return (
                                <article key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">{pkg.code}</p>
                                            <h3 className="mt-1 font-semibold text-slate-900">{pkg.name}</h3>
                                        </div>
                                        <Coins className="w-5 h-5 text-amber-500" />
                                    </div>

                                    <p className="mt-3 text-2xl font-semibold text-slate-900">+{pkg.total_coins.toLocaleString("id-ID")} koin</p>
                                    <p className="text-xs text-slate-500">
                                        {pkg.coins.toLocaleString("id-ID")} dasar + {pkg.bonus_coins.toLocaleString("id-ID")} bonus
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">{formatIDR(pkg.price)}</p>
                                        <Button
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() => runCheckout({ item_type: "topup", item_id: pkg.id }, pkg.name)}
                                        >
                                            {isProcessing ? "Membuka..." : "Top Up"}
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <article className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                            <Crown className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Butuh chat tanpa batas?</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">Premium dikelola di Billing</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {recommendedPlan
                                    ? `${recommendedPlan.name} mulai ${formatIDR(recommendedPlan.price)} untuk ${recommendedPlan.duration_days} hari.`
                                    : "Bandingkan Free, Premium, dan B2B sebelum membeli paket."}
                            </p>
                            <Link href={ROUTES.BILLING}>
                                <Button variant="outline" className="mt-4 gap-2 border-violet-300 text-violet-700 hover:bg-violet-50">
                                    Buka Billing
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Untuk organisasi</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">Premium B2B Mitra</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {recommendedBusinessPlan
                                    ? `${recommendedBusinessPlan.name} mulai ${formatIDR(Number(recommendedBusinessPlan.base_price_per_seat ?? 0))} per seat.`
                                    : "Kelola seat, approval, analytics agregat, dan onboarding anggota."}
                            </p>
                            <Link href={user?.role === "mitra" ? ROUTES.MITRA.SUBSCRIPTION : ROUTES.CONTACT}>
                                <Button variant="outline" className="mt-4 gap-2 border-sky-300 text-sky-700 hover:bg-sky-50">
                                    {user?.role === "mitra" ? "Kelola Mitra" : "Hubungi Tim B2B"}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}
