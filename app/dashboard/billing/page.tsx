"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, BadgeCheck, Building2, Check, Coins, CreditCard, Crown, Download, Loader2, Lock, ReceiptText, Sparkles } from "lucide-react";
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
    if (normalized === "paid") return "bg-primary/10 text-primary";
    if (normalized === "pending") return "bg-amber-100 text-amber-700";
    if (normalized === "expired" || normalized === "failed" || normalized === "canceled") {
        return "bg-primary/10 text-primary";
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
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [isExporting, setIsExporting] = useState(false);

    const fetchTransactions = useCallback(async (page = 1) => {
        if (!token) return;

        const shouldShowPaginationLoader = page !== 1;
        if (shouldShowPaginationLoader) {
            setIsPaginating(true);
        }

        try {
            const txRes = await billingService.getTransactions(token, {
                page,
                limit: 10,
                status: statusFilter || undefined,
                item_type: typeFilter || undefined,
            });
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
    }, [token, statusFilter, typeFilter]);

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

    // Muat ulang daftar transaksi saat filter berubah (tanpa reload seluruh halaman).
    useEffect(() => {
        if (!loading) {
            void fetchTransactions(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, typeFilter]);

    const handleExportCsv = useCallback(async () => {
        if (!token) return;
        setIsExporting(true);
        try {
            await billingService.exportTransactionsCSV(token, {
                status: statusFilter || undefined,
                item_type: typeFilter || undefined,
            });
            toast.success("Riwayat transaksi diunduh");
        } catch {
            toast.error("Gagal mengunduh riwayat transaksi");
        } finally {
            setIsExporting(false);
        }
    }, [token, statusFilter, typeFilter]);

    const handleDownloadInvoice = useCallback(async (orderId: string) => {
        if (!token) return;
        try {
            await billingService.downloadInvoice(token, orderId);
            toast.success("Invoice diunduh");
        } catch {
            toast.error("Gagal mengunduh invoice");
        }
    }, [token]);

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
            <section className="rounded-3xl border border-theme-story-border bg-linear-to-br from-theme-story-from via-white to-theme-story-to p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Billing Overview</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Status Paket dan Riwayat Pembayaran</h1>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                            Pantau tier akun, kuota chat AI, dan transaksi langganan/top up dalam satu tempat.
                        </p>
                        <span className="mt-3 inline-flex rounded-full border border-theme-story-border bg-white px-3 py-1 text-xs font-semibold text-theme-story-heading">
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
                    <div className="rounded-2xl border border-theme-story-border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Tier Aktif</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{currentTier}</p>
                        <p className="mt-1 text-xs text-slate-500">Akses premium: {formatPremiumAccess(status)}</p>
                    </div>
                    <div className="rounded-2xl border border-theme-story-border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Saldo Koin</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{(status?.gold_coins ?? 0).toLocaleString("id-ID")}</p>
                        <p className="mt-1 text-xs text-slate-500">Digunakan untuk reward</p>
                    </div>
                    <div className="rounded-2xl border border-theme-story-border bg-white p-4">
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-theme-accent-text">Gratis, Premium, B2B</p>
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
                    {status?.entitlement_source === "b2b" && (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-theme-accent/30 bg-theme-accent/10 px-3 py-2 text-xs font-medium text-theme-accent-dark">
                            <Building2 className="h-4 w-4" />
                            Premium kamu berasal dari organisasi B2B — pembelian Premium pribadi dinonaktifkan.
                        </span>
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
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary/80" /> Akses fitur inti dashboard.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary/80" /> Chat AI sampai kuota periode ini.</p>
                            <p className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 text-amber-600" /> Misi premium dan chat tanpa batas terkunci.</p>
                        </div>
                    </article>

                    <article className={`rounded-2xl border p-4 ${status?.is_premium ? "border-theme-accent/40 bg-theme-accent/10" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-theme-accent-text">Premium</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">Akun Premium</h3>
                            </div>
                            {status?.is_premium && (
                                <span className="rounded-full bg-theme-accent/20 px-2.5 py-1 text-[11px] font-semibold text-theme-accent-dark">Aktif</span>
                            )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Chat AI tanpa batas selama masa aktif paket.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Seat B2B aktif otomatis dihitung sebagai Premium B2B.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Misi premium harian dengan XP dan koin ekstra.</p>
                        </div>
                    </article>

                    <article className={`rounded-2xl border p-4 ${status?.entitlement_source === "b2b" || user?.role === "mitra" ? "border-theme-accent/40 bg-theme-accent/10" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-theme-accent-text">Premium B2B</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">Organisasi Mitra</h3>
                            </div>
                            {status?.entitlement_source === "b2b" || user?.role === "mitra" ? (
                                <span className="rounded-full bg-theme-accent/20 px-2.5 py-1 text-[11px] font-semibold text-theme-accent-dark">Aktif</span>
                            ) : (
                                <Building2 className="h-5 w-5 text-theme-accent-text" />
                            )}
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Seat premium untuk anggota organisasi.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Dashboard mitra, analytics agregat, approval, dan seat management.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Cocok untuk kampus, komunitas, atau perusahaan.</p>
                        </div>
                        <div className="mt-4">
                            {user?.role === "mitra" ? (
                                <Link href={ROUTES.MITRA.DASHBOARD}>
                                    <Button size="sm" variant="outline" className="w-full border-theme-accent/40 text-theme-accent-dark hover:bg-theme-accent/10">
                                        Kelola Dashboard Mitra
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={ROUTES.CONTACT}>
                                    <Button size="sm" variant="outline" className="w-full border-theme-accent/40 text-theme-accent-dark hover:bg-theme-accent/10">
                                        Konsultasi B2B
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </article>
                </div>
            </section>

            {recommendedBusinessPlan && user?.role !== "mitra" && status?.entitlement_source !== "b2b" && (
                <section className="rounded-2xl border border-theme-accent-border bg-theme-accent-soft p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-theme-accent-text">Butuh banyak seat?</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">{recommendedBusinessPlan.name}</h2>
                            <p className="mt-1 text-sm text-slate-700">
                                Mulai dari {formatIDR(Number(recommendedBusinessPlan.base_price_per_seat ?? 0))} / seat untuk akses premium organisasi.
                            </p>
                        </div>
                        <Link href={ROUTES.CONTACT}>
                            <Button variant="outline" className="gap-2 border-theme-accent/40 bg-white text-theme-accent-dark hover:bg-theme-accent/10">
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
                <section className="rounded-2xl border border-theme-story-border bg-theme-story-from p-4">
                    <div className="flex items-start gap-3">
                        <BadgeCheck className="w-5 h-5 text-theme-story-icon mt-0.5" />
                        <div>
                            <h2 className="text-base font-semibold text-theme-story-heading">Langganan Aktif: {status.subscription.plan_name}</h2>
                            <p className="text-sm text-theme-story-heading mt-1">
                                Aktif {formatDateTime(status.subscription.starts_at)} sampai {formatDateTime(status.subscription.ends_at)}.
                            </p>
                            <p className="text-xs text-theme-story-heading mt-1 opacity-80">Order: {status.subscription.source_order_id}</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <ReceiptText className="w-5 h-5 text-slate-700" />
                        <h2 className="text-lg font-semibold text-slate-900">Riwayat Transaksi</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter status"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                        >
                            <option value="">Semua status</option>
                            <option value="paid">Berhasil</option>
                            <option value="pending">Menunggu</option>
                            <option value="failed">Gagal</option>
                            <option value="expired">Kedaluwarsa</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            aria-label="Filter tipe"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                        >
                            <option value="">Semua tipe</option>
                            <option value="subscription">Premium</option>
                            <option value="topup">Top Up</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCsv}
                            disabled={isExporting || transactions.length === 0}
                        >
                            <Download className="w-4 h-4 mr-1.5" />
                            {isExporting ? "Mengunduh..." : "Export CSV"}
                        </Button>
                    </div>
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
                                        <th className="text-right font-medium py-2">Invoice</th>
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
                                            <td className="py-2.5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {tx.status.toLowerCase() === "pending" && tx.snap_token && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-7 text-xs"
                                                            disabled={processingKey === `${tx.item_type}-${tx.item_id}`}
                                                            onClick={() => runCheckout({ item_type: tx.item_type as any, item_id: tx.item_id, snap_token: tx.snap_token }, "Lanjutkan")}
                                                        >
                                                            Bayar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadInvoice(tx.order_id)}
                                                        title="Unduh invoice"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
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

            <section className="rounded-2xl border border-theme-accent-border bg-theme-accent-soft p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-theme-accent-text mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-theme-accent-dark">Pembayaran diproses via Midtrans</p>
                    <p className="text-xs text-theme-accent-dark mt-1">
                        Setelah pembayaran selesai, status transaksi akan diperbarui otomatis via webhook.
                    </p>
                </div>
            </section>
        </div>
    );
}
