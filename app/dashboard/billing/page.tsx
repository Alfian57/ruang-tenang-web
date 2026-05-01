"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, BadgeCheck, Building2, Check, Coins, CreditCard, Crown, Loader2, Lock, ReceiptText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useBillingCheckout } from "@/hooks/useBillingCheckout";
import { useAuthStore } from "@/store/authStore";
import { billingService } from "@/services/api";
import type {
    BillingCatalog,
    BillingStatus,
    BillingTransaction,
    BillingTransactionList,
} from "@/types";

const IDR_FORMATTER = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatIDR(amount: number): string {
    return IDR_FORMATTER.format(Number.isFinite(amount) ? amount : 0);
}

function formatDateTime(value?: string): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusClass(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized === "paid") return "bg-emerald-100 text-emerald-700";
    if (normalized === "pending") return "bg-amber-100 text-amber-700";
    if (normalized === "expired" || normalized === "failed" || normalized === "canceled") {
        return "bg-rose-100 text-rose-700";
    }
    return "bg-slate-100 text-slate-700";
}

function formatPremiumAccess(status: BillingStatus | null): string {
    if (!status?.is_premium) return "-";
    if (status.entitlement_source === "b2b") {
        return status.b2b_organization_id ? `B2B #${status.b2b_organization_id}` : "B2B organisasi";
    }
    return formatDateTime(status.premium_expires_at);
}

export default function BillingPage() {
    const { token, user, refreshUser } = useAuthStore();

    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
    const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
    const [transactionMeta, setTransactionMeta] = useState<Pick<BillingTransactionList, "page" | "limit" | "total" | "total_pages">>({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 1,
    });

    const [loading, setLoading] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);

    const fetchTransactions = useCallback(async (page = 1) => {
        if (!token) return;

        const shouldShowPaginationLoader = page !== 1;
        if (shouldShowPaginationLoader) {
            setIsPaginating(true);
        }

        try {
            const txRes = await billingService.getTransactions(token, { page, limit: 10 });
            setTransactions(txRes.data.transactions ?? []);
            setTransactionMeta({
                page: txRes.data.page ?? 1,
                limit: txRes.data.limit ?? 10,
                total: txRes.data.total ?? 0,
                total_pages: txRes.data.total_pages ?? 1,
            });
        } catch {
            toast.error("Gagal memuat transaksi billing");
        } finally {
            if (shouldShowPaginationLoader) {
                setIsPaginating(false);
            }
        }
    }, [token]);

    const refreshData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [statusRes, catalogRes] = await Promise.all([
                billingService.getStatus(token),
                billingService.getCatalog(token),
            ]);
            setStatus(statusRes.data);
            setCatalog(catalogRes.data);
            await fetchTransactions(1);
        } catch {
            toast.error("Gagal memuat data billing", {
                description: "Silakan muat ulang halaman.",
            });
        } finally {
            setLoading(false);
        }
    }, [fetchTransactions, token]);

    useEffect(() => {
        void refreshData();
    }, [refreshData]);

    const { processingKey, runCheckout } = useBillingCheckout({
        token,
        onRefresh: refreshData,
        refreshUser,
    });

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

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <section className="rounded-3xl border border-violet-100 bg-linear-to-br from-violet-50 via-white to-indigo-50 p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">Billing Overview</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Status Paket dan Riwayat Pembayaran</h1>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                            Pantau tier akun, kuota chat AI, dan transaksi langganan/top up dalam satu tempat.
                        </p>
                        <span className="mt-3 inline-flex rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                            Paket aktif: {currentTier}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={ROUTES.TOPUP}>
                            <Button className="gap-2">
                                <Coins className="w-4 h-4" />
                                Top Up Koin
                            </Button>
                        </Link>
                        <Button variant="outline" className="gap-2" onClick={() => void refreshData()}>
                            <ArrowLeftRight className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-violet-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Tier Aktif</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{currentTier}</p>
                        <p className="mt-1 text-xs text-slate-500">Akses premium: {formatPremiumAccess(status)}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Saldo Koin</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{(status?.gold_coins ?? 0).toLocaleString("id-ID")}</p>
                        <p className="mt-1 text-xs text-slate-500">Digunakan untuk reward</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Kuota Chat AI</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {status?.chat_quota.is_unlimited
                                ? "Tanpa batas"
                                : `${Math.max(0, status?.chat_quota.remaining ?? 0)} sisa / ${status?.chat_quota.limit ?? 0}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Reset: {formatDateTime(status?.chat_quota.reset_at)}</p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Gratis, Premium, B2B</p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-900">Pilih jalur akses yang sesuai</h2>
                    </div>
                    {!status?.is_premium && recommendedPlan && user?.role !== "mitra" && (
                        <Button
                            size="sm"
                            className="gap-2"
                            disabled={processingKey === `subscription-${recommendedPlan.id}`}
                            onClick={() => runCheckout({ item_type: "subscription", item_id: recommendedPlan.id }, recommendedPlan.name)}
                        >
                            <Crown className="w-4 h-4" />
                            Upgrade Premium
                        </Button>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <article className={`rounded-2xl border p-4 ${!status?.is_premium ? "border-amber-300 bg-amber-50/70" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-amber-700">Freemium</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">Akun Gratis</h3>
                            </div>
                            {!status?.is_premium && (
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Aktif</span>
                            )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Akses fitur inti dashboard.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Chat AI sampai kuota periode ini.</p>
                            <p className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 text-amber-600" /> Misi premium dan chat tanpa batas terkunci.</p>
                        </div>
                    </article>

                    <article className={`rounded-2xl border p-4 ${status?.is_premium ? "border-violet-300 bg-violet-50/70" : "border-violet-200 bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-violet-700">Premium</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">Akun Premium</h3>
                            </div>
                            {status?.is_premium && (
                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">Aktif</span>
                            )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Chat AI tanpa batas selama masa aktif paket.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Seat B2B aktif otomatis dihitung sebagai Premium B2B.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Misi premium harian dengan XP dan koin ekstra.</p>
                        </div>
                    </article>

                    <article className={`rounded-2xl border p-4 ${status?.entitlement_source === "b2b" || user?.role === "mitra" ? "border-sky-300 bg-sky-50/80" : "border-sky-200 bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-sky-700">Premium B2B</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">Organisasi Mitra</h3>
                            </div>
                            {status?.entitlement_source === "b2b" || user?.role === "mitra" ? (
                                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">Aktif</span>
                            ) : (
                                <Building2 className="h-5 w-5 text-sky-600" />
                            )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Seat premium untuk anggota organisasi.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Dashboard mitra, analytics agregat, approval, dan seat management.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Cocok untuk kampus, komunitas, atau perusahaan.</p>
                        </div>
                        <div className="mt-4">
                            {user?.role === "mitra" ? (
                                <Link href={ROUTES.MITRA.DASHBOARD}>
                                    <Button size="sm" variant="outline" className="w-full border-sky-300 text-sky-700 hover:bg-sky-100">
                                        Kelola Dashboard Mitra
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={ROUTES.CONTACT}>
                                    <Button size="sm" variant="outline" className="w-full border-sky-300 text-sky-700 hover:bg-sky-100">
                                        Konsultasi B2B
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </article>
                </div>
            </section>

            {recommendedBusinessPlan && user?.role !== "mitra" && status?.entitlement_source !== "b2b" && (
                <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-sky-700">Butuh banyak seat?</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">{recommendedBusinessPlan.name}</h2>
                            <p className="mt-1 text-sm text-slate-700">
                                Mulai dari {formatIDR(Number(recommendedBusinessPlan.base_price_per_seat ?? 0))} / seat untuk akses premium organisasi.
                            </p>
                        </div>
                        <Link href={ROUTES.CONTACT}>
                            <Button variant="outline" className="gap-2 border-sky-300 bg-white text-sky-700 hover:bg-sky-100">
                                <Building2 className="w-4 h-4" />
                                Hubungi Tim B2B
                            </Button>
                        </Link>
                    </div>
                </section>
            )}

            {!status?.is_premium && user?.role !== "mitra" && recommendedPlan && (
                <section className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-yellow-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-amber-700">Rekomendasi Upgrade</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">{recommendedPlan.name}</h2>
                            <p className="mt-1 text-sm text-slate-700">
                                {recommendedPlan.description || "Tingkatkan kuota chat dan buka misi premium eksklusif."}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {formatIDR(recommendedPlan.price)} / {recommendedPlan.duration_days} hari
                            </p>
                        </div>
                        <Button
                            className="gap-2"
                            disabled={processingKey === `subscription-${recommendedPlan.id}`}
                            onClick={() => runCheckout({ item_type: "subscription", item_id: recommendedPlan.id }, recommendedPlan.name)}
                        >
                            <Sparkles className="w-4 h-4" />
                            {processingKey === `subscription-${recommendedPlan.id}` ? "Membuka..." : "Upgrade Premium"}
                        </Button>
                    </div>
                </section>
            )}

            {status?.subscription && (
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="flex items-start gap-3">
                        <BadgeCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                            <h2 className="text-base font-semibold text-emerald-900">Langganan Aktif: {status.subscription.plan_name}</h2>
                            <p className="text-sm text-emerald-800 mt-1">
                                Aktif {formatDateTime(status.subscription.starts_at)} sampai {formatDateTime(status.subscription.ends_at)}.
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">Order: {status.subscription.source_order_id}</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                    <ReceiptText className="w-5 h-5 text-slate-700" />
                    <h2 className="text-lg font-semibold text-slate-900">Riwayat Transaksi</h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                        Belum ada transaksi pada akun ini.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-170 text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="text-left font-medium py-2">Tanggal</th>
                                        <th className="text-left font-medium py-2">Item</th>
                                        <th className="text-left font-medium py-2">Tipe</th>
                                        <th className="text-left font-medium py-2">Nominal</th>
                                        <th className="text-left font-medium py-2">Status</th>
                                        <th className="text-left font-medium py-2">Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx: BillingTransaction) => (
                                        <tr key={tx.id} className="border-b border-slate-100 align-top">
                                            <td className="py-2.5 text-slate-700">{formatDateTime(tx.created_at)}</td>
                                            <td className="py-2.5 text-slate-900 font-medium">{tx.item_name}</td>
                                            <td className="py-2.5 text-slate-700">{tx.item_type === "subscription" ? "Premium" : "Top Up"}</td>
                                            <td className="py-2.5 text-slate-900">{formatIDR(tx.amount)}</td>
                                            <td className="py-2.5">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(tx.status)}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-slate-500 text-xs">{tx.order_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Menampilkan halaman {transactionMeta.page} dari {transactionMeta.total_pages} ({transactionMeta.total} transaksi)
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={transactionMeta.page <= 1 || isPaginating}
                                    onClick={() => void fetchTransactions(transactionMeta.page - 1)}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={transactionMeta.page >= transactionMeta.total_pages || isPaginating}
                                    onClick={() => void fetchTransactions(transactionMeta.page + 1)}
                                >
                                    {isPaginating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Berikutnya"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-900">Pembayaran diproses via Midtrans</p>
                    <p className="text-xs text-blue-700 mt-1">
                        Setelah pembayaran selesai, status transaksi akan diperbarui otomatis via webhook.
                    </p>
                </div>
            </section>
        </div>
    );
}
