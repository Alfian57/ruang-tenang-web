"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Coins, Loader2, Wallet } from "lucide-react";
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
import { BillingMetricCard } from "./BillingMetricCard";

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

export default function CoinsPanel() {
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
        <div className="space-y-5 py-1">
            <section className="relative overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(120deg,#fff_0%,#fff8f5_100%)] p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-theme-accent-dark">Saldo perjalanan</p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Tambah koin untuk reward</h2>
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                            Tukarkan saldo koin dengan hadiah dan benefit perjalananmu.
                        </p>
                    </div>
                    <Image src="/images/dashboard/mascot/daily-missions.webp" alt="" width={96} height={96} sizes="96px" className="hidden h-20 w-20 shrink-0 object-contain sm:block" />
                    <Link href={ROUTES.BILLING} className="shrink-0">
                        <Button variant="outline" className="gap-2 rounded-xl border-rose-200 bg-white text-theme-accent-dark hover:bg-rose-50">
                            Lihat Paket
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <BillingMetricCard label="Saldo koin" value={(status?.gold_coins ?? user?.gold_coins ?? 0).toLocaleString("id-ID")} detail="Bisa dipakai untuk klaim reward" mascot="/images/dashboard/mascot/daily-missions.webp" />
                    <BillingMetricCard label="Tier aktif" value={currentTier} detail={`Akses: ${formatPremiumAccess(status)}`} mascot="/images/landing/mascot/secure.webp" />
                    <BillingMetricCard label="Kuota chat" value={quotaLabel} detail={`Reset: ${formatDate(quota?.reset_at)}`} mascot="/images/dashboard/mascot/chat-listen.webp" />
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-theme-accent-dark">
                        <Wallet className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Isi saldo</p>
                        <h2 className="text-base font-bold text-slate-900">Paket top up koin</h2>
                    </div>
                </div>

                {topupPackages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Paket top up belum tersedia</p>
                        <p className="mt-1">Coba muat ulang katalog atau buka tab Paket untuk melihat opsi Premium.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => void refreshData()}>
                                Muat Ulang
                            </Button>
                            <Link href={ROUTES.BILLING}>
                                <Button type="button" size="sm">
                                    Lihat Paket
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {topupPackages.map((pkg: BillingTopupPackage) => {
                            const isProcessing = processingKey === `topup-${pkg.id}`;
                            return (
                                <article key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{pkg.code}</p>
                                            <h3 className="mt-1 font-bold text-slate-900">{pkg.name}</h3>
                                        </div>
                                        <Coins className="w-5 h-5 text-amber-500" />
                                    </div>

                                    <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">+{pkg.total_coins.toLocaleString("id-ID")} koin</p>
                                    <p className="text-xs text-slate-500">
                                        {pkg.coins.toLocaleString("id-ID")} dasar + {pkg.bonus_coins.toLocaleString("id-ID")} bonus
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">{formatIDR(pkg.price)}</p>
                                            <Button
                                                className="rounded-xl"
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
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <Image src="/images/landing/mascot/celebrate.webp" alt="" width={76} height={76} sizes="76px" className="h-14 w-14 shrink-0 object-contain" />
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-theme-accent-dark">Butuh chat tanpa batas?</p>
                            <h2 className="mt-1 text-base font-bold text-slate-900">Premium dikelola di tab Paket</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {recommendedPlan
                                    ? `${recommendedPlan.name} mulai ${formatIDR(recommendedPlan.price)} untuk ${recommendedPlan.duration_days} hari.`
                                    : "Bandingkan Free, Premium, dan B2B sebelum membeli paket."}
                            </p>
                            <Link href={ROUTES.BILLING}>
                                <Button variant="outline" className="mt-4 gap-2 rounded-xl border-rose-200 text-theme-accent-dark hover:bg-rose-50">
                                    Lihat Paket
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <Image src="/images/landing/mascot/community.webp" alt="" width={76} height={76} sizes="76px" className="h-14 w-14 shrink-0 object-contain" />
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-theme-accent-dark">Untuk organisasi</p>
                            <h2 className="mt-1 text-base font-bold text-slate-900">Premium B2B Mitra</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {recommendedBusinessPlan
                                    ? `${recommendedBusinessPlan.name} mulai ${formatIDR(Number(recommendedBusinessPlan.base_price_per_seat ?? 0))} per seat.`
                                    : "Kelola seat, approval, analytics agregat, dan onboarding anggota."}
                            </p>
                            <Link href={user?.role === "mitra" ? ROUTES.MITRA.SUBSCRIPTION : ROUTES.CONTACT}>
                                <Button variant="outline" className="mt-4 gap-2 rounded-xl border-rose-200 text-theme-accent-dark hover:bg-rose-50">
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
