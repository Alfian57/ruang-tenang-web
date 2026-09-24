"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, BadgeCheck, Building2, Check, Coins, Crown, Download, Loader2, Lock, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useBillingCheckout } from "@/hooks/useBillingCheckout";
import { useAuthStore } from "@/store/authStore";
import { billingService } from "@/services/api";
import { BillingMetricCard } from "./BillingMetricCard";
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

interface BillingPanelProps {
    mode: "packages" | "transactions";
}

export default function BillingPanel({ mode }: BillingPanelProps) {
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
    const [transactionError, setTransactionError] = useState(false);

    const fetchTransactions = useCallback(async (page = 1) => {
        if (!token) return;

        const shouldShowPaginationLoader = page !== 1;
        if (shouldShowPaginationLoader) {
            setIsPaginating(true);
        }

        try {
            setTransactionError(false);
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
            setTransactionError(true);
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
            if (mode === "transactions") {
                await fetchTransactions(1);
            } else {
                const [statusRes, catalogRes] = await Promise.all([
                    billingService.getStatus(token),
                    billingService.getCatalog(token),
                ]);
                setStatus(statusRes.data);
                setCatalog(catalogRes.data);
            }
        } catch {
            toast.error("Gagal memuat data billing", {
                description: "Silakan muat ulang halaman.",
            });
        } finally {
            setLoading(false);
        }
    }, [fetchTransactions, mode, token]);

    useEffect(() => {
        void refreshData();
    }, [refreshData]);

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
        <div className="space-y-5 py-1">
            {mode === "packages" && (
            <>
            <section className="rounded-[1.75rem] border border-rose-100 bg-[linear-gradient(135deg,#fff_0%,#fff_66%,#fff5f1_100%)] p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-theme-accent-dark">Ringkasan akun</p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Status paket dan kuota</h2>
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                            Pantau akses Premium, koin, dan kuota chat dalam satu tempat.
                        </p>
                        <span className="mt-3 inline-flex items-center rounded-full border border-rose-100 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-theme-accent" />Paket aktif: {currentTier}
                        </span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Link href={ROUTES.billingTab("coins")}>
                            <Button className="gap-2 rounded-xl">
                                <Coins className="w-4 h-4" />
                                Beli Koin
                            </Button>
                        </Link>
                        <Button variant="outline" className="gap-2 rounded-xl border-slate-200 bg-white" onClick={() => void refreshData()}>
                            <ArrowLeftRight className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <BillingMetricCard label="Tier aktif" value={currentTier} detail={`Akses premium: ${formatPremiumAccess(status)}`} mascot="/images/landing/mascot/secure.webp" />
                    <BillingMetricCard label="Saldo koin" value={(status?.gold_coins ?? 0).toLocaleString("id-ID")} detail="Digunakan untuk reward" mascot="/images/dashboard/mascot/daily-missions.webp" />
                    <BillingMetricCard label="Kuota chat" value={status?.chat_quota.is_unlimited ? "Tanpa batas" : `${Math.max(0, status?.chat_quota.remaining ?? 0)} / ${status?.chat_quota.limit ?? 0} tersisa`} detail={`Reset: ${formatDateTime(status?.chat_quota.reset_at)}`} mascot="/images/dashboard/mascot/chat-listen.webp" />
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                    <article className={`rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${!status?.is_premium ? "border-theme-accent-border bg-rose-50/50" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Freemium</p>
                                <h3 className="mt-1 text-base font-bold text-slate-900">Akun Gratis</h3>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                {!status?.is_premium && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-theme-accent-dark">Aktif</span>}
                                <Image src="/images/landing/mascot/secure.webp" alt="" width={64} height={64} sizes="64px" className="h-12 w-12 object-contain" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary/80" /> Akses fitur inti dashboard.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary/80" /> Chat AI sampai kuota periode ini.</p>
                            <p className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 text-amber-600" /> Misi premium dan chat tanpa batas terkunci.</p>
                        </div>
                    </article>

                    <article className={`rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${status?.is_premium ? "border-theme-accent-border bg-rose-50/50" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme-accent-dark">Premium</p>
                                <h3 className="mt-1 text-base font-bold text-slate-900">Akun Premium</h3>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                {status?.is_premium && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-theme-accent-dark">Aktif</span>}
                                <Image src="/images/landing/mascot/celebrate.webp" alt="" width={64} height={64} sizes="64px" className="h-12 w-12 object-contain" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Chat AI tanpa batas selama masa aktif paket.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Seat B2B aktif otomatis dihitung sebagai Premium B2B.</p>
                            <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-theme-accent-text" /> Misi premium harian dengan XP dan koin ekstra.</p>
                        </div>
                    </article>

                    <article className={`rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${status?.entitlement_source === "b2b" || user?.role === "mitra" ? "border-theme-accent-border bg-rose-50/50" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme-accent-dark">Premium B2B</p>
                                <h3 className="mt-1 text-base font-bold text-slate-900">Organisasi Mitra</h3>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                {(status?.entitlement_source === "b2b" || user?.role === "mitra") && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-theme-accent-dark">Aktif</span>}
                                <Image src="/images/landing/mascot/community.webp" alt="" width={64} height={64} sizes="64px" className="h-12 w-12 object-contain" />
                            </div>
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
                <section className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <Image src="/images/landing/mascot/community.webp" alt="" width={80} height={80} sizes="80px" className="h-14 w-14 shrink-0 object-contain" />
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme-accent-dark">Butuh banyak seat?</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-900">{recommendedBusinessPlan.name}</h2>
                                <p className="mt-1 text-sm text-slate-700">
                                    Mulai dari {formatIDR(Number(recommendedBusinessPlan.base_price_per_seat ?? 0))} / seat untuk akses premium organisasi.
                                </p>
                            </div>
                        </div>
                        <Link href={ROUTES.CONTACT}>
                            <Button variant="outline" className="gap-2 rounded-xl border-rose-200 bg-white text-theme-accent-dark hover:bg-rose-50">
                                <Building2 className="w-4 h-4" />
                                Hubungi Tim B2B
                            </Button>
                        </Link>
                    </div>
                </section>
            )}

            {!status?.is_premium && user?.role !== "mitra" && recommendedPlan && (
                <section className="rounded-2xl border border-rose-100 bg-[linear-gradient(115deg,#fff8f5_0%,#fff_72%)] p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme-accent-dark">Rekomendasi upgrade</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">{recommendedPlan.name}</h2>
                            <p className="mt-1 text-sm text-slate-700">
                                {recommendedPlan.description || "Tingkatkan kuota chat dan buka misi premium eksklusif."}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {formatIDR(recommendedPlan.price)} / {recommendedPlan.duration_days} hari
                            </p>
                        </div>
                        <Button
                            className="gap-2 rounded-xl"
                            disabled={processingKey === `subscription-${recommendedPlan.id}`}
                            onClick={() => runCheckout({ item_type: "subscription", item_id: recommendedPlan.id }, recommendedPlan.name)}
                        >
                            <BadgeCheck className="w-4 h-4" />
                            {processingKey === `subscription-${recommendedPlan.id}` ? "Membuka..." : "Upgrade Premium"}
                        </Button>
                    </div>
                </section>
            )}

            {status?.subscription && (
                <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Image src="/images/landing/mascot/secure.webp" alt="" width={72} height={72} sizes="72px" className="h-12 w-12 shrink-0 object-contain" />
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme-accent-dark">Paket aktif</p>
                            <h2 className="mt-0.5 text-base font-bold text-slate-900">{status.subscription.plan_name}</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Aktif {formatDateTime(status.subscription.starts_at)} sampai {formatDateTime(status.subscription.ends_at)}.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Order: {status.subscription.source_order_id}</p>
                        </div>
                    </div>
                </section>
            )}
            </>
            )}

            {mode === "transactions" && (
            <>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-theme-accent-dark">
                            <ReceiptText className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Aktivitas akun</p>
                            <h2 className="text-base font-bold text-slate-900">Riwayat transaksi</h2>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter status"
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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

                {transactionError ? (
                    <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-700">
                        <p>Riwayat transaksi gagal dimuat.</p>
                        <Button variant="outline" size="sm" className="mt-3 bg-white" onClick={() => void fetchTransactions(1)}>
                            Coba Lagi
                        </Button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
                        <Image src="/images/landing/mascot/secure.webp" alt="" width={84} height={84} sizes="84px" className="h-16 w-16 shrink-0 object-contain" />
                        <div>
                            <p className="font-semibold text-slate-800">Belum ada transaksi</p>
                            <p className="mt-0.5">Riwayat paket dan pembelian koinmu akan muncul di sini.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-170 text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        <th className="px-3 py-3 text-left font-semibold">Tanggal</th>
                                        <th className="px-3 py-3 text-left font-semibold">Item</th>
                                        <th className="px-3 py-3 text-left font-semibold">Tipe</th>
                                        <th className="px-3 py-3 text-left font-semibold">Nominal</th>
                                        <th className="px-3 py-3 text-left font-semibold">Status</th>
                                        <th className="px-3 py-3 text-left font-semibold">Order</th>
                                        <th className="px-3 py-3 text-right font-semibold">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx: BillingTransaction) => (
                                        <tr key={tx.id} className="align-top transition-colors hover:bg-rose-50/30 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-slate-100">
                                            <td className="px-3 py-3 text-slate-600">{formatDateTime(tx.created_at)}</td>
                                            <td className="px-3 py-3 font-semibold text-slate-900">{tx.item_name}</td>
                                            <td className="px-3 py-3 text-slate-600">{tx.item_type === "subscription" ? "Premium" : "Top Up"}</td>
                                            <td className="px-3 py-3 font-semibold text-slate-900">{formatIDR(tx.amount)}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(tx.status)}`}>
                                                        {tx.status}
                                                    </span>
                                                    {tx.refund_status && tx.refund_status !== "none" && (
                                                        <span className="text-xs text-slate-600">
                                                            {tx.refunded_amount
                                                                ? `Refund terkonfirmasi ${formatIDR(tx.refunded_amount)}`
                                                                : "Refund menunggu konfirmasi Midtrans"}
                                                        </span>
                                                    )}
                                                    {tx.refund_reconciliation_status === "pending" && (
                                                        <span className="text-xs font-medium text-amber-700">Sedang ditinjau operator</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-xs text-slate-500">{tx.order_id}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {tx.status.toLowerCase() === "pending" && tx.snap_token && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-7 text-xs"
                                                            disabled={processingKey === `${tx.item_type}-${tx.item_id}`}
                                                            onClick={() => runCheckout({ item_type: tx.item_type as "subscription" | "topup", item_id: tx.item_id, snap_token: tx.snap_token }, "Lanjutkan")}
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

            <section className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5">
                <Image src="/images/landing/mascot/key.webp" alt="" width={64} height={64} sizes="64px" className="h-11 w-11 shrink-0 object-contain" />
                <div>
                    <p className="text-sm font-bold text-slate-800">Pembayaran diproses via Midtrans</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        Setelah pembayaran selesai, status transaksi akan diperbarui otomatis via webhook.
                    </p>
                </div>
            </section>
            </>
            )}
        </div>
    );
}
