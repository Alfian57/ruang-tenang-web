"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    FileText,
    Loader2,
    Mail,
    Plus,
    ReceiptText,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Trash2,
    UserCheck,
    UserX,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { B2BAuditLog } from "@/types";
import { useMitraDashboard } from "../_hooks/useMitraDashboard";
import {
    formatCurrency,
    getMemberStatusCounts,
    getSeatUsagePercent,
    getStatusTone,
    getTotalMessages,
    type MitraDashboardSection,
} from "./mitra-dashboard-utils";

export type { MitraDashboardSection } from "./mitra-dashboard-utils";

interface MitraDashboardProps {
    initialSection?: MitraDashboardSection;
}

type PageMeta = {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description: string;
};

type UtilizationTrendPoint = {
    metricDate: string;
    dateLabel: string;
    utilizationPct: number;
    usedSeats: number;
    contractedSeats: number;
    availableSeats: number;
    messagesSent: number;
    activeMembers: number;
    pendingApprovals: number;
};

type AuditLogPresentation = {
    title: string;
    description: string;
    entityLabel: string;
    timeLabel: string;
    fullTimeLabel: string;
    Icon: LucideIcon;
    toneClass: string;
    iconClass: string;
};

const PAGE_META: Record<MitraDashboardSection, PageMeta> = {
    overview: {
        icon: Building2,
        eyebrow: "Mitra Workspace",
        title: "Dashboard Pengelola B2B",
        description: "Ringkasan operasional organisasi, seat premium, approval anggota, billing, dan rekomendasi tindakan.",
    },
    organizations: {
        icon: Users,
        eyebrow: "Operasional Anggota",
        title: "Organisasi dan Seat Member",
        description: "Kelola organisasi, undangan, approval anggota, dan status seat dari satu ruang kerja.",
    },
    subscription: {
        icon: CreditCard,
        eyebrow: "Kontrak dan Paket",
        title: "Langganan B2B",
        description: "Pantau paket aktif, ubah jumlah contracted seat, dan buat quote untuk perubahan kontrak.",
    },
    insights: {
        icon: BarChart3,
        eyebrow: "Analitik Seat",
        title: "Insight Penggunaan Organisasi",
        description: "Lihat utilisasi seat, status anggota, aktivitas agregat, dan riwayat audit tanpa membuka data pribadi pengguna.",
    },
    payments: {
        icon: Wallet,
        eyebrow: "Billing dan Pembayaran",
        title: "Pembayaran Mitra",
        description: "Kelola estimasi tagihan, quote pembayaran, periode kontrak, dan status biaya organisasi.",
    },
    settings: {
        icon: CheckCircle2,
        eyebrow: "Pengaturan Operasional",
        title: "Onboarding dan Reminder",
        description: "Atur template sambutan anggota dan jalankan reminder kontrak atau utilisasi seat.",
    },
};

function formatBillingCycle(value?: string | null): string {
    if (value === "monthly") return "bulanan";
    if (value === "yearly") return "tahunan";
    return value || "-";
}

function formatReadableStatus(value?: string | null): string {
    const labels: Record<string, string> = {
        active: "Aktif",
        invited: "Diundang",
        pending_approval: "Menunggu Approval",
        removed: "Dihapus",
        owner: "Owner",
        admin: "Admin",
        member: "Member",
        inactive: "Nonaktif",
        suspended: "Ditangguhkan",
    };

    if (!value) return "-";
    return labels[value] ?? value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusDotClass(status: string): string {
    if (status === "active") return "bg-red-500";
    if (status === "invited") return "bg-rose-500";
    if (status === "pending_approval") return "bg-amber-500";
    if (status === "removed") return "bg-gray-400";
    return "bg-gray-500";
}

function formatDate(value?: string | null): string {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatShortDate(value?: string | null): string {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
    });
}

function formatDateTime(value?: string | null): string {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatRelativeTime(value?: string | null): string {
    if (!value) return "-";
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return "-";

    const diffMs = Date.now() - time;
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));
    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return formatShortDate(value);
}

function getDaysUntil(value?: string | null): number | null {
    if (!value) return null;
    const target = new Date(value).getTime();
    if (!Number.isFinite(target)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target - today.getTime()) / 86_400_000);
}

function getStringMetadata(log: B2BAuditLog, key: string): string {
    const value = log.metadata?.[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return "";
}

function getAuditEntityLabel(entityType?: string, entityId?: string) {
    const label = {
        organization: "Organisasi",
        organization_member: "Anggota",
        b2b_subscription: "Langganan",
        b2b_reminder_job: "Reminder",
        b2b_sso_config: "SSO",
    }[entityType ?? ""] ?? (entityType || "Aktivitas");

    return entityId ? `${label} #${entityId}` : label;
}

function getAuditLogPresentation(log: B2BAuditLog): AuditLogPresentation {
    const email = getStringMetadata(log, "email");
    const role = getStringMetadata(log, "role");
    const seatCount = getStringMetadata(log, "contracted_seats");
    const billingCycle = getStringMetadata(log, "billing_cycle");
    const generated = getStringMetadata(log, "generated");
    const sent = getStringMetadata(log, "sent");
    const action = log.action;

    const base = {
        entityLabel: getAuditEntityLabel(log.entity_type, log.entity_id),
        timeLabel: formatRelativeTime(log.created_at),
        fullTimeLabel: formatDateTime(log.created_at),
    };

    if (action.includes("member.invited") || action === "member_invited") {
        return {
            ...base,
            title: "Undangan anggota dibuat",
            description: email ? `${email}${role ? ` sebagai ${role}` : ""}` : "Link undangan anggota baru dibuat.",
            Icon: Mail,
            toneClass: "border-rose-100 bg-rose-50",
            iconClass: "bg-rose-100 text-rose-700",
        };
    }

    if (action.includes("member.approved")) {
        return {
            ...base,
            title: "Anggota disetujui",
            description: email || "Permintaan akses anggota disetujui dan seat siap digunakan.",
            Icon: UserCheck,
            toneClass: "border-emerald-100 bg-emerald-50",
            iconClass: "bg-emerald-100 text-emerald-700",
        };
    }

    if (action.includes("member.rejected")) {
        return {
            ...base,
            title: "Anggota ditolak",
            description: email || "Permintaan akses anggota ditolak.",
            Icon: UserX,
            toneClass: "border-amber-100 bg-amber-50",
            iconClass: "bg-amber-100 text-amber-700",
        };
    }

    if (action.includes("member.removed")) {
        return {
            ...base,
            title: "Anggota dihapus",
            description: email || "Akses anggota dilepas dari organisasi.",
            Icon: Trash2,
            toneClass: "border-gray-200 bg-gray-50",
            iconClass: "bg-gray-200 text-gray-700",
        };
    }

    if (action.includes("pending_approval")) {
        return {
            ...base,
            title: "Menunggu approval anggota",
            description: email || "Anggota sudah menerima undangan dan menunggu keputusan admin organisasi.",
            Icon: AlertCircle,
            toneClass: "border-amber-100 bg-amber-50",
            iconClass: "bg-amber-100 text-amber-700",
        };
    }

    if (action.includes("subscription")) {
        return {
            ...base,
            title: action.includes("seat_upgraded") ? "Seat langganan diperbarui" : "Langganan B2B diperbarui",
            description: seatCount
                ? `${seatCount} seat${billingCycle ? `, siklus ${formatBillingCycle(billingCycle)}` : ""}`
                : "Perubahan kontrak atau status langganan tercatat.",
            Icon: CreditCard,
            toneClass: "border-red-100 bg-red-50",
            iconClass: "bg-red-100 text-red-700",
        };
    }

    if (action.includes("reminder")) {
        return {
            ...base,
            title: "Reminder organisasi diproses",
            description: generated || sent ? `${generated || 0} dibuat, ${sent || 0} terkirim` : "Reminder kontrak atau utilisasi diproses.",
            Icon: RefreshCw,
            toneClass: "border-sky-100 bg-sky-50",
            iconClass: "bg-sky-100 text-sky-700",
        };
    }

    if (action.includes("organization.created")) {
        return {
            ...base,
            title: "Organisasi dibuat",
            description: getStringMetadata(log, "name") || "Workspace organisasi baru berhasil dibuat.",
            Icon: Building2,
            toneClass: "border-red-100 bg-red-50",
            iconClass: "bg-red-100 text-red-700",
        };
    }

    return {
        ...base,
        title: action.replaceAll("_", " ").replaceAll(".", " "),
        description: "Aktivitas operasional organisasi tercatat.",
        Icon: Activity,
        toneClass: "border-gray-200 bg-gray-50",
        iconClass: "bg-gray-200 text-gray-700",
    };
}

function PageSection({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <section className={`grid min-w-0 grid-cols-1 gap-4 ${className}`}>{children}</section>;
}

function MetricCard({
    label,
    value,
    helper,
    tone = "red",
}: {
    label: string;
    value: string | number;
    helper?: string;
    tone?: "red" | "amber" | "rose" | "gray";
}) {
    const toneClass = {
        red: "border-red-100 bg-white text-red-700",
        amber: "border-amber-200 bg-amber-50 text-amber-800",
        rose: "border-rose-200 bg-rose-50 text-rose-800",
        gray: "border-gray-200 bg-white text-gray-700",
    }[tone];

    return (
        <article className={`min-w-0 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${toneClass}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
            {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
        </article>
    );
}

function AuditLogList({
    logs,
    limit,
    variant = "compact",
    emptyTitle = "Belum ada catatan audit",
    emptyDescription = "Aktivitas operasional organisasi akan muncul di sini setelah ada perubahan data.",
}: {
    logs: B2BAuditLog[];
    limit?: number;
    variant?: "compact" | "detail";
    emptyTitle?: string;
    emptyDescription?: string;
}) {
    const visibleLogs = typeof limit === "number" ? logs.slice(0, limit) : logs;

    if (visibleLogs.length === 0) {
        return (
            <div className="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-5 text-sm">
                <div className="flex flex-col gap-3 xs:flex-row xs:items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-950">{emptyTitle}</p>
                        <p className="mt-1 leading-6 text-gray-600">{emptyDescription}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {visibleLogs.map((log) => {
                const presentation = getAuditLogPresentation(log);
                const Icon = presentation.Icon;

                if (variant === "detail") {
                    return (
                        <div key={log.id} className={`min-w-0 rounded-2xl border p-4 ${presentation.toneClass}`}>
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${presentation.iconClass}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <p className="break-words text-sm font-semibold text-gray-950">{presentation.title}</p>
                                            <p className="mt-1 break-words text-sm leading-6 text-gray-700">{presentation.description}</p>
                                        </div>
                                        <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200/70">
                                            <Clock className="h-3.5 w-3.5" />
                                            {presentation.timeLabel}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-white/75 p-3 text-xs text-gray-600 ring-1 ring-gray-200/70 sm:grid-cols-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold uppercase tracking-wide text-gray-400">Objek</p>
                                            <p className="mt-1 break-words font-medium text-gray-800">{presentation.entityLabel}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold uppercase tracking-wide text-gray-400">Waktu</p>
                                            <p className="mt-1 break-words font-medium text-gray-800">{presentation.fullTimeLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={log.id} className={`min-w-0 rounded-xl border p-3 transition-shadow hover:shadow-sm ${presentation.toneClass}`}>
                        <div className="flex min-w-0 gap-3">
                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${presentation.iconClass}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-semibold text-gray-950">{presentation.title}</p>
                                        <p className="mt-1 break-words text-sm leading-5 text-gray-600">{presentation.description}</p>
                                    </div>
                                    <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200/70">
                                        <Clock className="h-3.5 w-3.5" />
                                        {presentation.timeLabel}
                                    </span>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className="max-w-full break-words rounded-full bg-white/85 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200/70">
                                        {presentation.entityLabel}
                                    </span>
                                    <span className="break-words">{presentation.fullTimeLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function MitraDashboard({ initialSection = "overview" }: MitraDashboardProps) {
    const {
        user,
        organizations,
        plans,
        summary,
        members,
        analytics,
        auditLogs,
        onboardingTemplate,
        pricingRecommendation,
        lastInvite,
        bulkInviteResult,
        lastQuote,
        selectedOrganizationId,
        isLoading,
        isLoadingDetail,
        isSubmitting,
        errorMessage,
        setSelectedOrganizationId,
        refresh,
        createOrganization,
        inviteMember,
        bulkInviteMembers,
        approveMember,
        rejectMember,
        removeMember,
        createQuote,
        upgradeSeats,
        saveOnboardingTemplate,
        runReminders,
    } = useMitraDashboard();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [organizationForm, setOrganizationForm] = useState({
        name: "",
        contact_email: user?.email ?? "",
        code: "",
        business_type: "",
    });
    const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "member" });
    const [bulkInviteText, setBulkInviteText] = useState("");
    const [quoteForm, setQuoteForm] = useState({ plan_id: "", requested_seats: "25", billing_cycle: "monthly" });
    const [upgradeForm, setUpgradeForm] = useState({ contracted_seats: "", billing_cycle: "monthly" });
    const [onboardingDraft, setOnboardingDraft] = useState({ title: "", welcome_message: "", checklist: "" });

    const activePlans = useMemo(() => plans.filter((plan) => plan.is_active), [plans]);
    const selectedQuotePlan = useMemo(() => {
        return activePlans.find((plan) => String(plan.id) === quoteForm.plan_id) ?? null;
    }, [activePlans, quoteForm.plan_id]);
    const seatUsage = summary?.seat_usage;
    const seatUsagePercent = getSeatUsagePercent(seatUsage);
    const subscription = summary?.subscription;
    const pendingMembers = useMemo(() => members.filter((member) => member.status === "pending_approval"), [members]);
    const selectedOrganization = organizations.find((item) => item.organization.id === selectedOrganizationId);
    const selectedOrganizationName = selectedOrganization?.organization.name ?? "Belum memilih organisasi";
    const hasOrganizations = organizations.length > 0;
    const hasActiveSubscription = Boolean(subscription);
    const totalMessages = useMemo(() => getTotalMessages(analytics), [analytics]);
    const utilizationTrend = useMemo<UtilizationTrendPoint[]>(() => {
        return (analytics?.trend ?? []).slice(-14).map((item) => {
            const contractedSeats = Math.max(0, item.contracted_seats ?? 0);
            const usedSeats = Math.max(0, item.used_seats ?? 0);
            const utilizationPct = contractedSeats > 0
                ? Math.round(Math.min(100, (usedSeats / contractedSeats) * 100))
                : 0;

            return {
                metricDate: item.metric_date,
                dateLabel: formatShortDate(item.metric_date),
                utilizationPct,
                usedSeats,
                contractedSeats,
                availableSeats: Math.max(0, contractedSeats - usedSeats),
                messagesSent: Math.max(0, item.messages_sent ?? 0),
                activeMembers: Math.max(0, item.active_members ?? 0),
                pendingApprovals: Math.max(0, item.pending_approvals ?? 0),
            };
        });
    }, [analytics?.trend]);
    const latestTrendPoint = utilizationTrend[utilizationTrend.length - 1];
    const previousTrendPoint = utilizationTrend[utilizationTrend.length - 2];
    const utilizationDelta = latestTrendPoint && previousTrendPoint
        ? latestTrendPoint.utilizationPct - previousTrendPoint.utilizationPct
        : 0;
    const averageUtilization = utilizationTrend.length > 0
        ? Math.round(utilizationTrend.reduce((total, item) => total + item.utilizationPct, 0) / utilizationTrend.length)
        : 0;
    const peakUtilization = utilizationTrend.reduce((peak, item) => Math.max(peak, item.utilizationPct), 0);
    const peakMessages = utilizationTrend.reduce((peak, item) => Math.max(peak, item.messagesSent), 0);
    const memberStatusCounts = useMemo(() => {
        return getMemberStatusCounts(members, analytics?.member_status_counts);
    }, [members, analytics]);
    const daysUntilRenewal = getDaysUntil(subscription?.ends_at);
    const pageMeta = PAGE_META[initialSection];
    const PageIcon = pageMeta.icon;

    const subscriptionStateLabel = hasActiveSubscription
        ? `${subscription?.plan_name} - ${formatBillingCycle(subscription?.billing_cycle)}`
        : "Belum ada langganan aktif";

    const seatUsageTone = seatUsagePercent >= 90
        ? "rose"
        : seatUsagePercent >= 75
            ? "amber"
            : "red";

    const workflowLinks = [
        {
            href: ROUTES.MITRA.ORGANIZATIONS,
            icon: Users,
            title: "Kelola Anggota",
            description: `${pendingMembers.length} approval pending, ${members.length} anggota terdaftar`,
            action: "Buka organisasi",
        },
        {
            href: ROUTES.MITRA.SUBSCRIPTION,
            icon: CreditCard,
            title: "Atur Langganan",
            description: hasActiveSubscription ? `${seatUsage?.available_seats ?? 0} seat tersisa` : "Aktifkan kontrak B2B",
            action: "Buka langganan",
        },
        {
            href: ROUTES.MITRA.INSIGHTS,
            icon: BarChart3,
            title: "Pantau Utilisasi",
            description: `${seatUsagePercent}% seat terpakai, ${totalMessages} pesan agregat`,
            action: "Buka analitik",
        },
        {
            href: ROUTES.MITRA.PAYMENTS,
            icon: Wallet,
            title: "Cek Pembayaran",
            description: subscription ? `${formatCurrency(subscription.total_amount)} / ${formatBillingCycle(subscription.billing_cycle)}` : "Buat quote pembayaran",
            action: "Buka pembayaran",
        },
    ];

    useEffect(() => {
        if (!onboardingTemplate) {
            setOnboardingDraft({ title: "", welcome_message: "", checklist: "" });
            return;
        }

        setOnboardingDraft({
            title: onboardingTemplate.title ?? "",
            welcome_message: onboardingTemplate.welcome_message ?? "",
            checklist: (onboardingTemplate.checklist ?? []).join("\n"),
        });
    }, [onboardingTemplate]);

    useEffect(() => {
        if (activePlans.length === 0) {
            if (quoteForm.plan_id) {
                setQuoteForm((previous) => ({ ...previous, plan_id: "" }));
            }
            return;
        }

        const hasSelectedPlan = activePlans.some((plan) => String(plan.id) === quoteForm.plan_id);
        if (!hasSelectedPlan) {
            const firstPlan = activePlans[0];
            setQuoteForm((previous) => {
                const requestedSeats = Number(previous.requested_seats);
                const nextRequestedSeats = Number.isFinite(requestedSeats) && requestedSeats >= firstPlan.min_seats && requestedSeats <= firstPlan.max_seats
                    ? String(Math.floor(requestedSeats))
                    : String(firstPlan.min_seats);

                return {
                    ...previous,
                    plan_id: String(firstPlan.id),
                    requested_seats: nextRequestedSeats,
                };
            });
        }
    }, [activePlans, quoteForm.plan_id]);

    const handleQuotePlanChange = (value: string) => {
        const plan = activePlans.find((item) => String(item.id) === value);

        setQuoteForm((previous) => {
            const requestedSeats = Number(previous.requested_seats);
            const nextRequestedSeats = plan && (!Number.isFinite(requestedSeats) || requestedSeats < plan.min_seats || requestedSeats > plan.max_seats)
                ? String(plan.min_seats)
                : previous.requested_seats;

            return {
                ...previous,
                plan_id: value,
                requested_seats: nextRequestedSeats,
            };
        });
    };

    useEffect(() => {
        if (typeof subscription?.contracted_seats === "number") {
            setUpgradeForm({
                contracted_seats: String(subscription.contracted_seats),
                billing_cycle: subscription.billing_cycle || "monthly",
            });
            return;
        }

        setUpgradeForm({ contracted_seats: "", billing_cycle: "monthly" });
    }, [subscription?.billing_cycle, subscription?.contracted_seats]);

    const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!organizationForm.name.trim() || !organizationForm.contact_email.trim()) {
            toast.error("Nama organisasi dan email kontak wajib diisi.");
            return;
        }

        try {
            await createOrganization({
                name: organizationForm.name.trim(),
                contact_email: organizationForm.contact_email.trim(),
                code: organizationForm.code.trim() || undefined,
                business_type: organizationForm.business_type.trim() || undefined,
            });
            toast.success("Organisasi berhasil dibuat.");
            setOrganizationForm((previous) => ({ ...previous, name: "", code: "", business_type: "" }));
            setShowCreateForm(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal membuat organisasi.");
        }
    };

    const handleInviteMember = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inviteForm.email.trim()) {
            toast.error("Email anggota wajib diisi.");
            return;
        }

        try {
            await inviteMember({
                email: inviteForm.email.trim(),
                full_name: inviteForm.full_name.trim() || undefined,
                role: inviteForm.role as "admin" | "member",
            });
            toast.success("Undangan berhasil dibuat.");
            setInviteForm({ email: "", full_name: "", role: "member" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengundang anggota.");
        }
    };

    const handleBulkInvite = async () => {
        const rows = bulkInviteText
            .split("\n")
            .map((row) => row.trim())
            .filter(Boolean)
            .map((row) => {
                const [email, fullName] = row.split(",").map((item) => item.trim());
                return { email, full_name: fullName || undefined, role: "member" as const };
            });

        if (rows.length === 0) {
            toast.error("Masukkan minimal satu email.");
            return;
        }

        try {
            await bulkInviteMembers(rows);
            toast.success("Bulk invite diproses.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal memproses bulk invite.");
        }
    };

    const handleCopyInviteLink = async () => {
        if (!lastInvite?.link) return;
        try {
            await navigator.clipboard.writeText(lastInvite.link);
            toast.success("Link undangan disalin.");
        } catch {
            toast.error("Gagal menyalin link undangan.");
        }
    };

    const handleCreateQuote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!quoteForm.plan_id || !selectedOrganizationId) {
            toast.error("Pilih organisasi dan paket terlebih dahulu.");
            return;
        }

        const requestedSeats = Number(quoteForm.requested_seats);
        if (!Number.isFinite(requestedSeats) || requestedSeats < 1) {
            toast.error("Jumlah seat quote minimal 1.");
            return;
        }
        if (!selectedQuotePlan) {
            toast.error("Paket B2B tidak ditemukan. Pilih ulang paket terlebih dahulu.");
            return;
        }

        const normalizedRequestedSeats = Math.floor(requestedSeats);
        if (normalizedRequestedSeats < selectedQuotePlan.min_seats || normalizedRequestedSeats > selectedQuotePlan.max_seats) {
            toast.error(`Jumlah seat untuk ${selectedQuotePlan.name} harus ${selectedQuotePlan.min_seats}-${selectedQuotePlan.max_seats}.`);
            return;
        }

        try {
            await createQuote({
                organization_id: selectedOrganizationId,
                plan_id: Number(quoteForm.plan_id),
                requested_seats: normalizedRequestedSeats,
                billing_cycle: quoteForm.billing_cycle as "monthly" | "yearly",
            });
            toast.success("Quote berhasil dibuat.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal membuat quote.");
        }
    };

    const handleUpgradeSeats = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const contractedSeats = Number(upgradeForm.contracted_seats);
        const usedSeats = summary?.seat_usage.used_seats ?? 1;

        if (!Number.isFinite(contractedSeats) || contractedSeats < usedSeats) {
            toast.error(`Contracted seat minimal ${usedSeats}.`);
            return;
        }

        try {
            await upgradeSeats({
                contracted_seats: contractedSeats,
                billing_cycle: upgradeForm.billing_cycle as "monthly" | "yearly",
            });
            toast.success("Seat langganan diperbarui.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal memperbarui seat.");
        }
    };

    const handleSaveOnboarding = async () => {
        try {
            await saveOnboardingTemplate({
                role: "member",
                title: onboardingDraft.title.trim(),
                welcome_message: onboardingDraft.welcome_message.trim(),
                checklist: onboardingDraft.checklist.split("\n").map((item) => item.trim()).filter(Boolean),
                is_default: true,
                is_active: true,
            });
            toast.success("Template onboarding disimpan.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan onboarding.");
        }
    };

    const handleRunReminders = async () => {
        try {
            await runReminders();
            toast.success("Pengingat diproses.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal memproses pengingat.");
        }
    };

    const handleApproveMember = async (memberId: number) => {
        try {
            await approveMember(memberId);
            toast.success("Anggota disetujui.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyetujui anggota.");
        }
    };

    const handleRejectMember = async (memberId: number) => {
        try {
            await rejectMember(memberId);
            toast.success("Anggota ditolak.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menolak anggota.");
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        try {
            await removeMember(memberId);
            toast.success("Anggota dihapus.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus anggota.");
        }
    };

    const renderCreateOrganizationForm = () => {
        if (!showCreateForm) return null;

        return (
            <form onSubmit={handleCreateOrganization} className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-red-100 bg-red-50/40 p-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="organization-name">Nama Organisasi</Label>
                    <Input id="organization-name" placeholder="Contoh: Kampus Nusantara Sehat" value={organizationForm.name} onChange={(event) => setOrganizationForm((prev) => ({ ...prev, name: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="organization-email">Email Kontak</Label>
                    <Input id="organization-email" type="email" placeholder="wellbeing@kampus.ac.id" value={organizationForm.contact_email} onChange={(event) => setOrganizationForm((prev) => ({ ...prev, contact_email: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="organization-code">Kode</Label>
                    <Input id="organization-code" placeholder="kampus-nusantara" value={organizationForm.code} onChange={(event) => setOrganizationForm((prev) => ({ ...prev, code: event.target.value }))} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="organization-type">Jenis Organisasi</Label>
                    <Input id="organization-type" placeholder="education, corporate, komunitas, atau healthcare" value={organizationForm.business_type} onChange={(event) => setOrganizationForm((prev) => ({ ...prev, business_type: event.target.value }))} />
                </div>
                <div className="flex flex-col gap-2 xs:flex-row xs:justify-end md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Organisasi
                    </Button>
                </div>
            </form>
        );
    };

    const renderHeader = () => (
        <section data-mitra-tour="mitra-header" className="relative min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 max-w-2xl">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-700">
                        <PageIcon className="h-4 w-4" />
                        {pageMeta.eyebrow}
                    </p>
                    <h1 className="mt-1 text-xl font-bold text-gray-950 xs:text-2xl lg:text-3xl">{pageMeta.title}</h1>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{pageMeta.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-red-700">
                        <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1">{organizations.length} organisasi</span>
                        <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1">{seatUsage?.used_seats ?? 0} seat aktif</span>
                        <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1">{pendingMembers.length} approval pending</span>
                    </div>
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                        value={selectedOrganizationId ? String(selectedOrganizationId) : ""}
                        onValueChange={(value) => setSelectedOrganizationId(Number(value))}
                    >
                        <SelectTrigger className="w-full border-red-100 bg-red-50/40 sm:w-72">
                            <SelectValue placeholder="Pilih organisasi" />
                        </SelectTrigger>
                        <SelectContent>
                            {organizations.map((item) => (
                                <SelectItem key={item.organization.id} value={String(item.organization.id)}>
                                    {item.organization.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" className="border-red-100 bg-white hover:bg-red-50 hover:text-red-700" onClick={() => refresh()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button type="button" onClick={() => setShowCreateForm((value) => !value)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Organisasi
                    </Button>
                </div>
            </div>
            {renderCreateOrganizationForm()}
        </section>
    );

    const renderNoOrganizationState = () => {
        if (hasOrganizations) return null;

        return (
            <article className="rounded-2xl border border-dashed border-red-200 bg-red-50/70 p-4 text-sm text-red-800 sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-semibold text-red-900">Belum ada organisasi</p>
                        <p className="mt-1">Buat organisasi pertama untuk membuka invite anggota, subscription, analytics, dan pembayaran.</p>
                    </div>
                    <Button type="button" onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Organisasi
                    </Button>
                </div>
            </article>
        );
    };

    const renderKpiCards = () => (
        <PageSection className="md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Organisasi" value={organizations.length} helper="workspace yang dikelola" />
            <MetricCard label="Seat aktif" value={seatUsage?.used_seats ?? 0} helper={`dari ${seatUsage?.contracted_seats ?? 0} seat`} />
            <MetricCard label="Utilisasi" value={`${analytics?.seat_utilization_pct ?? seatUsagePercent}%`} helper={`${seatUsage?.available_seats ?? 0} seat tersisa`} tone={seatUsageTone} />
            <MetricCard label="Chat agregat 30 hari" value={totalMessages} helper="tanpa isi percakapan" />
        </PageSection>
    );

    const renderOverview = () => (
        <>
            <section className="rounded-2xl border border-red-100 bg-red-50/70 p-4 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-red-700">Pusat Kendali Mitra</p>
                        <h2 className="mt-1 text-lg font-semibold text-gray-900">{selectedOrganizationName}</h2>
                        <p className="mt-1 text-sm text-gray-600">Pilih alur kerja sesuai kebutuhan operasional hari ini.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs font-medium text-red-700 xs:grid-cols-2 md:flex md:flex-wrap">
                        <span className="rounded-lg border border-red-100 bg-white px-3 py-2">Seat {seatUsagePercent}%</span>
                        <span className="rounded-lg border border-red-100 bg-white px-3 py-2">Approval {pendingMembers.length}</span>
                        <span className="rounded-lg border border-red-100 bg-white px-3 py-2">Billing {hasActiveSubscription ? "aktif" : "perlu setup"}</span>
                    </div>
                </div>
            </section>

            {renderKpiCards()}

            <div data-mitra-tour="mitra-workflow-shortcuts">
                <PageSection className="md:grid-cols-2 xl:grid-cols-4">
                    {workflowLinks.map((item) => (
                        <Link key={item.href} href={item.href} className="group min-w-0 rounded-2xl border border-red-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md sm:p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-950">{item.title}</h3>
                            <p className="mt-1 min-h-10 text-sm leading-5 text-gray-600">{item.description}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-700 group-hover:gap-2">
                                {item.action}
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </Link>
                    ))}
                </PageSection>
            </div>

            <PageSection className="xl:grid-cols-3">
                <article data-mitra-tour="mitra-recent-activity" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Activity className="h-5 w-5 text-red-600" />
                        Aktivitas Terbaru
                    </h2>
                    <AuditLogList
                        logs={auditLogs}
                        limit={5}
                        emptyTitle="Belum ada aktivitas terbaru"
                        emptyDescription="Undangan, approval anggota, perubahan seat, dan reminder organisasi akan tampil di sini."
                    />
                </article>

                <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Fokus Berikutnya
                    </h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
                            <p className="font-semibold text-red-900">Approval anggota</p>
                            <p className="mt-1 text-red-800">{pendingMembers.length} anggota menunggu keputusan.</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-3">
                            <p className="font-semibold text-gray-900">Periode billing</p>
                            <p className="mt-1 text-gray-600">{daysUntilRenewal === null ? "Belum ada periode aktif." : `${daysUntilRenewal} hari sampai akhir periode.`}</p>
                        </div>
                    </div>
                </article>
            </PageSection>
        </>
    );

    const renderOrganizations = () => {
        const selectedOrg = selectedOrganization?.organization;
        const statusCards = [
            { key: "active", label: "Aktif", helper: "Seat sedang dipakai" },
            { key: "invited", label: "Diundang", helper: "Menunggu aktivasi" },
            { key: "pending_approval", label: "Perlu Approval", helper: "Butuh keputusan" },
            { key: "removed", label: "Dihapus", helper: "Akses dilepas" },
        ];

        return (
            <PageSection className="items-start xl:grid-cols-12">
                <aside className="min-w-0 space-y-4 xl:col-span-4">
                    <article data-mitra-tour="mitra-organizations-list" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Building2 className="h-5 w-5 text-red-600" />
                                Daftar Organisasi
                            </h2>
                            <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                {organizations.length} workspace
                            </span>
                        </div>
                        <div className="mt-4 max-h-[24rem] space-y-2 overflow-auto pr-1">
                            {organizations.map((item) => {
                                const isSelected = item.organization.id === selectedOrganizationId;

                                return (
                                    <button
                                        key={item.organization.id}
                                        type="button"
                                        onClick={() => setSelectedOrganizationId(item.organization.id)}
                                        className={`w-full rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${isSelected ? "border-red-200 bg-red-50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                                    >
                                        <div className="flex min-w-0 items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="break-words font-semibold text-gray-950">{item.organization.name}</p>
                                                <p className="mt-1 break-all text-xs text-gray-500">{item.organization.contact_email}</p>
                                            </div>
                                            {isSelected && (
                                                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                                                    Dipilih
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">{formatReadableStatus(item.organization.status)}</span>
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">{formatReadableStatus(item.member_role)}</span>
                                            <span className={`rounded-full px-2 py-0.5 font-medium ${getStatusTone(item.member_status)}`}>{formatReadableStatus(item.member_status)}</span>
                                        </div>
                                    </button>
                                );
                            })}
                            {organizations.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                                    Belum ada organisasi. Buat organisasi pertama dari tombol di header.
                                </div>
                            )}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <CheckCircle2 className="h-5 w-5 text-red-600" />
                            Ringkasan Organisasi
                        </h2>
                        {selectedOrg ? (
                            <div className="mt-4 space-y-4">
                                <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                                    <p className="break-words font-semibold text-gray-950">{selectedOrg.name}</p>
                                    <p className="mt-1 break-all text-sm text-gray-600">{selectedOrg.contact_email}</p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-white px-2.5 py-1 font-medium text-red-700 ring-1 ring-red-100">{selectedOrg.code}</span>
                                        <span className="rounded-full bg-white px-2.5 py-1 font-medium text-gray-700 ring-1 ring-red-100">{selectedOrg.business_type || "Tipe belum diisi"}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-gray-700">Pemakaian seat</span>
                                        <span className="font-semibold text-gray-950">{seatUsage?.used_seats ?? 0}/{seatUsage?.contracted_seats ?? 0}</span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                                        <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, Math.max(0, seatUsagePercent))}%` }} />
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        {seatUsage?.available_seats ?? 0} seat tersedia. Approval anggota {selectedOrg.requires_member_approval ? "aktif" : "otomatis"}.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-medium text-gray-500">Langganan</p>
                                        <p className="mt-1 break-words font-semibold text-gray-950">{subscription?.plan_name ?? "Belum aktif"}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-medium text-gray-500">Approval</p>
                                        <p className="mt-1 font-semibold text-gray-950">{pendingMembers.length}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4 text-sm leading-6 text-gray-600">
                                Pilih organisasi untuk melihat ringkasan seat, status langganan, dan approval anggota.
                            </div>
                        )}
                    </article>
                </aside>

                <div className="min-w-0 space-y-4 xl:col-span-8">
                    <article data-mitra-tour="mitra-member-invite" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <Users className="h-5 w-5 text-red-600" />
                                    Anggota dan Approval
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-gray-600">Buat undangan satuan untuk anggota baru dan tentukan role aksesnya.</p>
                            </div>
                            {summary && (
                                <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                    {members.length} anggota
                                </span>
                            )}
                        </div>

                        {isLoadingDetail ? (
                            <div className="mt-4 h-44 animate-pulse rounded-2xl bg-gray-100" />
                        ) : !summary ? (
                            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                                Pilih organisasi untuk melihat anggota.
                            </div>
                        ) : (
                            <form onSubmit={handleInviteMember} className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-4 lg:grid-cols-12">
                                <div className="space-y-1.5 lg:col-span-5">
                                    <Label htmlFor="invite-email">Email</Label>
                                    <Input id="invite-email" type="email" placeholder="anggota@kampus.ac.id" value={inviteForm.email} onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))} />
                                </div>
                                <div className="space-y-1.5 lg:col-span-3">
                                    <Label htmlFor="invite-name">Nama</Label>
                                    <Input id="invite-name" placeholder="Nama lengkap anggota" value={inviteForm.full_name} onChange={(event) => setInviteForm((prev) => ({ ...prev, full_name: event.target.value }))} />
                                </div>
                                <div className="space-y-1.5 lg:col-span-2">
                                    <Label>Role</Label>
                                    <Select value={inviteForm.role} onValueChange={(value) => setInviteForm((prev) => ({ ...prev, role: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end lg:col-span-2">
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Undang
                                    </Button>
                                </div>
                            </form>
                        )}

                        {summary && lastInvite && (
                            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800 md:flex-row md:items-center md:justify-between">
                                <span className="break-all">{lastInvite.link}</span>
                                <Button type="button" size="sm" variant="outline" onClick={handleCopyInviteLink}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Salin
                                </Button>
                            </div>
                        )}
                    </article>

                    {!isLoadingDetail && summary && (
                        <>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <article data-mitra-tour="mitra-bulk-invite" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-950">Bulk Invite</h3>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">Tempel beberapa email sekaligus, satu anggota per baris.</p>
                                        </div>
                                        <Mail className="h-5 w-5 shrink-0 text-red-600" />
                                    </div>
                                    <Label htmlFor="bulk-invite" className="mt-4 block">Daftar anggota</Label>
                                    <Textarea id="bulk-invite" className="mt-2 min-h-32" value={bulkInviteText} onChange={(event) => setBulkInviteText(event.target.value)} placeholder={"anggota1@kampus.ac.id, Andi Pratama\nanggota2@kampus.ac.id, Sinta Ayu"} />
                                    <Button type="button" variant="outline" className="mt-3 w-full xs:w-auto" onClick={handleBulkInvite} disabled={isSubmitting}>
                                        Proses Bulk Invite
                                    </Button>
                                    {bulkInviteResult && (
                                        <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                            {bulkInviteResult.invited} invited, {bulkInviteResult.skipped} skipped dari {bulkInviteResult.total} baris.
                                        </p>
                                    )}
                                </article>

                                <article data-mitra-tour="mitra-member-status" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-950">Status Anggota</h3>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">Pantau distribusi anggota untuk organisasi terpilih.</p>
                                        </div>
                                        <Users className="h-5 w-5 shrink-0 text-red-600" />
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm xs:grid-cols-2">
                                        {statusCards.map((status) => (
                                            <div key={status.key} className="rounded-xl bg-gray-50 p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{status.label}</p>
                                                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusDotClass(status.key)}`} />
                                                </div>
                                                <p className="mt-2 text-2xl font-bold text-gray-950">{memberStatusCounts[status.key] ?? 0}</p>
                                                <p className="mt-1 text-xs text-gray-500">{status.helper}</p>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            </div>

                            <article data-mitra-tour="mitra-member-list" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-950">Daftar Anggota</h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Kelola approval dan akses anggota organisasi.</p>
                                    </div>
                                    {pendingMembers.length > 0 && (
                                        <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                            {pendingMembers.length} perlu approval
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <p className="break-words font-medium text-gray-900">{member.full_name || member.email}</p>
                                                <p className="break-all text-xs text-gray-500">{member.email}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{formatReadableStatus(member.role)}</span>
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusTone(member.status)}`}>{formatReadableStatus(member.status)}</span>
                                                {member.status === "pending_approval" && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => handleApproveMember(member.id)}>
                                                            <UserCheck className="mr-1 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleRejectMember(member.id)}>
                                                            <UserX className="mr-1 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {member.role !== "owner" && member.status !== "removed" && (
                                                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" aria-label={`Hapus akses ${member.full_name || member.email}`} onClick={() => handleRemoveMember(member.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {members.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm leading-6 text-gray-600">
                                            Belum ada anggota. Buat link undangan atau gunakan bulk invite untuk mulai mengisi seat organisasi.
                                        </div>
                                    )}
                                </div>
                            </article>
                        </>
                    )}
                </div>
            </PageSection>
        );
    };

    const renderQuoteForm = (title = "Quote dan Rekomendasi", submitLabel = "Buat Quote") => (
        <article data-mitra-tour="mitra-quote-form" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Sparkles className="h-5 w-5 text-red-600" />
                {title}
            </h2>
            <form onSubmit={handleCreateQuote} className="mt-4 space-y-3">
                <div className="space-y-1.5">
                    <Label>Paket</Label>
                    <Select value={quoteForm.plan_id} onValueChange={handleQuotePlanChange}>
                        <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
                        <SelectContent>
                            {activePlans.map((plan) => (
                                <SelectItem key={plan.id} value={String(plan.id)}>
                                    {plan.name} - {formatCurrency(plan.base_price_per_seat)} / seat
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedQuotePlan && (
                        <p className="text-xs text-gray-500">
                            Batas paket: {selectedQuotePlan.min_seats}-{selectedQuotePlan.max_seats} seat.
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="quote-seats">Jumlah seat</Label>
                        <Input
                            id="quote-seats"
                            type="number"
                            min={selectedQuotePlan?.min_seats ?? 1}
                            max={selectedQuotePlan?.max_seats}
                            placeholder={String(selectedQuotePlan?.min_seats ?? 25)}
                            value={quoteForm.requested_seats}
                            onChange={(event) => setQuoteForm((prev) => ({ ...prev, requested_seats: event.target.value }))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Siklus billing</Label>
                        <Select value={quoteForm.billing_cycle} onValueChange={(value) => setQuoteForm((prev) => ({ ...prev, billing_cycle: value }))}>
                            <SelectTrigger><SelectValue placeholder="Pilih siklus" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Bulanan</SelectItem>
                                <SelectItem value="yearly">Tahunan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button type="submit" variant="outline" disabled={isSubmitting || activePlans.length === 0 || !selectedQuotePlan}>{submitLabel}</Button>
            </form>
            {lastQuote && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm">
                    <p className="font-semibold text-red-900">{lastQuote.quote_code}</p>
                    <p className="text-red-800">{formatCurrency(lastQuote.final_amount)} sampai {formatDate(lastQuote.valid_until)}</p>
                </div>
            )}
            {pricingRecommendation && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">
                    Rekomendasi: {pricingRecommendation.recommended_seats} seat, siklus {formatBillingCycle(pricingRecommendation.recommended_billing_cycle)}, tingkat keyakinan {pricingRecommendation.confidence_score}%.
                </div>
            )}
        </article>
    );

    const renderSubscription = () => (
        <PageSection className="xl:grid-cols-5">
            <article data-mitra-tour="mitra-subscription-summary" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CreditCard className="h-5 w-5 text-red-600" />
                    Langganan dan Seat
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 p-4 md:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Paket aktif</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{subscription?.plan_name || "Belum aktif"}</p>
                        <p className="mt-1 text-sm text-gray-600">{subscription ? `${formatCurrency(subscription.total_amount)} / ${formatBillingCycle(subscription.billing_cycle)}` : "Kontrak langganan belum aktif."}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Sisa seat</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{seatUsage?.available_seats ?? 0}</p>
                        <p className="mt-1 text-sm text-gray-600">{seatUsage?.used_seats ?? 0} digunakan</p>
                    </div>
                </div>

                {!subscription && (
                    <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Langganan belum aktif. Buat quote dari panel kanan atau koordinasikan aktivasi kontrak sebelum mengundang banyak anggota.
                    </div>
                )}

                <form onSubmit={handleUpgradeSeats} className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="upgrade-seats">Contracted seat</Label>
                        <Input id="upgrade-seats" type="number" min={summary?.seat_usage.used_seats ?? 1} placeholder="120" value={upgradeForm.contracted_seats} onChange={(event) => setUpgradeForm((prev) => ({ ...prev, contracted_seats: event.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Siklus billing</Label>
                        <Select value={upgradeForm.billing_cycle} onValueChange={(value) => setUpgradeForm((prev) => ({ ...prev, billing_cycle: value }))}>
                            <SelectTrigger><SelectValue placeholder="Pilih siklus" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Bulanan</SelectItem>
                                <SelectItem value="yearly">Tahunan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={isSubmitting || !subscription}>
                            Perbarui Seat
                        </Button>
                    </div>
                </form>
            </article>

            <div className="xl:col-span-2">{renderQuoteForm()}</div>

            <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-red-600" />
                    Paket Tersedia
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {activePlans.map((plan) => (
                        <div key={plan.id} className="rounded-2xl border border-gray-200 p-4">
                            <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                            <p className="mt-1 text-xl font-bold text-red-700">{formatCurrency(plan.base_price_per_seat)}</p>
                            <p className="mt-1 text-xs text-gray-500">Minimal {plan.min_seats} seat, maksimal {plan.max_seats} seat</p>
                            <p className="mt-3 text-sm leading-5 text-gray-600">{plan.description}</p>
                        </div>
                    ))}
                    {activePlans.length === 0 && <p className="text-sm text-gray-600">Belum ada paket aktif.</p>}
                </div>
            </article>
        </PageSection>
    );

    const renderInsights = () => (
        <>
            {renderKpiCards()}
            <PageSection className="xl:grid-cols-5">
                <article data-mitra-tour="mitra-utilization-trend" className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm xl:col-span-3">
                    <div className="border-b border-red-50 bg-linear-to-br from-red-50 via-white to-orange-50 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Tren Utilisasi</p>
                                <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <BarChart3 className="h-5 w-5 text-red-600" />
                                    Seat Premium 14 Hari Terakhir
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                                    Pantau tekanan kapasitas seat, momentum anggota aktif, dan volume pesan agregat tanpa membuka data pribadi pengguna.
                                </p>
                            </div>
                            <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${utilizationDelta >= 0 ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                                {utilizationDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {Math.abs(utilizationDelta)}% dari titik sebelumnya
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[
                                ["Saat ini", `${latestTrendPoint?.utilizationPct ?? seatUsagePercent}%`, `${latestTrendPoint?.usedSeats ?? seatUsage?.used_seats ?? 0}/${latestTrendPoint?.contractedSeats ?? seatUsage?.contracted_seats ?? 0} seat`],
                                ["Rata-rata", `${averageUtilization}%`, "periode tampil"],
                                ["Puncak", `${peakUtilization}%`, `${peakMessages} pesan tertinggi`],
                                ["Sisa seat", latestTrendPoint?.availableSeats ?? seatUsage?.available_seats ?? 0, "kapasitas siap pakai"],
                            ].map(([label, value, helper]) => (
                                <div key={String(label)} className="rounded-2xl border border-white/80 bg-white/85 p-3 shadow-xs">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                                    <p className="mt-1 text-xl font-bold text-gray-950">{value}</p>
                                    <p className="mt-1 text-xs text-gray-500">{helper}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5">
                        {utilizationTrend.length > 0 ? (
                            <>
                                <div className="h-72 min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={utilizationTrend} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="mitraUtilizationFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.28} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#fee2e2" strokeDasharray="4 4" vertical={false} />
                                            <XAxis
                                                dataKey="dateLabel"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                minTickGap={12}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `${value}%`}
                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                            />
                                            <Tooltip
                                                cursor={{ stroke: "#ef4444", strokeWidth: 1, strokeDasharray: "4 4" }}
                                                contentStyle={{
                                                    borderRadius: 14,
                                                    border: "1px solid #fecaca",
                                                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                                                }}
                                                labelFormatter={(_, payload) => {
                                                    const point = payload?.[0]?.payload as UtilizationTrendPoint | undefined;
                                                    return point ? formatDate(point.metricDate) : "";
                                                }}
                                                formatter={(value, name, payload) => {
                                                    const point = payload.payload as UtilizationTrendPoint;
                                                    if (name === "utilizationPct") {
                                                        return [`${value}% (${point.usedSeats}/${point.contractedSeats} seat)`, "Utilisasi"];
                                                    }
                                                    return [value, name];
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="utilizationPct"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                fill="url(#mitraUtilizationFill)"
                                                activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2, fill: "#ef4444" }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {utilizationTrend.slice(-3).map((item) => (
                                        <div key={item.metricDate} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-gray-600">{formatShortDate(item.metricDate)}</p>
                                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-red-700">{item.utilizationPct}%</span>
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                                <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.max(4, item.utilizationPct)}%` }} />
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                <span>{item.usedSeats} seat aktif</span>
                                                <span className="text-right">{item.messagesSent} pesan</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6 text-sm text-gray-700">
                                <p className="font-semibold text-gray-900">Belum ada trend analitik.</p>
                                <p className="mt-1 leading-relaxed">
                                    Data akan muncul setelah anggota mulai memakai seat premium. Undang anggota, aktifkan seat,
                                    lalu buka halaman ini lagi untuk melihat kurva utilisasi.
                                </p>
                            </div>
                        )}
                    </div>
                </article>

                <article data-mitra-tour="mitra-audit-log" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Activity className="h-5 w-5 text-red-600" />
                        Audit Terbaru
                    </h2>
                    <AuditLogList
                        logs={auditLogs}
                        limit={8}
                        variant="detail"
                        emptyTitle="Audit belum tersedia"
                        emptyDescription="Riwayat audit organisasi akan tampil setelah ada aksi pengelolaan anggota, langganan, atau reminder."
                    />
                </article>
            </PageSection>
        </>
    );

    const renderPayments = () => {
        const payableAmount = lastQuote?.final_amount ?? subscription?.total_amount ?? 0;
        const billingPeriod = subscription ? `${formatDate(subscription.starts_at)} - ${formatDate(subscription.ends_at)}` : "Belum ada periode aktif";
        const dueLabel = lastQuote ? formatDate(lastQuote.valid_until) : formatDate(subscription?.ends_at);

        return (
            <PageSection className="xl:grid-cols-5">
                <article data-mitra-tour="mitra-payment-summary" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <ReceiptText className="h-5 w-5 text-red-600" />
                        Ringkasan Tagihan
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 md:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Nominal berjalan</p>
                            <p className="mt-1 text-2xl font-bold text-gray-950 xs:text-3xl">{formatCurrency(payableAmount)}</p>
                            <p className="mt-1 text-sm text-red-800">{lastQuote ? `Quote ${lastQuote.quote_code}` : subscriptionStateLabel}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Jatuh tempo</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{dueLabel}</p>
                            <p className="mt-1 text-sm text-gray-600">{daysUntilRenewal === null ? "Belum aktif" : `${daysUntilRenewal} hari tersisa`}</p>
                        </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                        <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
                            <span className="text-gray-500">Organisasi</span>
                            <span className="font-medium text-gray-900 xs:text-right">{selectedOrganizationName}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
                            <span className="text-gray-500">Periode</span>
                            <span className="font-medium text-gray-900 xs:text-right">{billingPeriod}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
                            <span className="text-gray-500">Seat</span>
                            <span className="font-medium text-gray-900 xs:text-right">{seatUsage?.used_seats ?? 0}/{seatUsage?.contracted_seats ?? 0}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 px-4 py-3 text-sm xs:grid-cols-2">
                            <span className="text-gray-500">Status</span>
                            <span className="font-medium text-gray-900 xs:text-right">{subscription?.status ?? "quote diperlukan"}</span>
                        </div>
                    </div>
                </article>

                <div className="xl:col-span-2">{renderQuoteForm("Quote Pembayaran", "Buat Quote Pembayaran")}</div>

                <article data-mitra-tour="mitra-payment-flow" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-5">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Clock className="h-5 w-5 text-red-600" />
                        Flow Pembayaran
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {[
                            ["1", "Buat quote", "Pilih paket, seat, dan siklus billing sesuai kebutuhan organisasi."],
                            ["2", "Konfirmasi tagihan", "Gunakan quote terbaru sebagai acuan nominal dan periode pembayaran."],
                            ["3", "Aktivasi seat", "Setelah pembayaran dikonfirmasi, seat premium siap dialokasikan ke anggota."],
                        ].map(([step, title, description]) => (
                            <div key={step} className="rounded-2xl border border-gray-200 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-700">{step}</div>
                                <p className="mt-3 font-semibold text-gray-900">{title}</p>
                                <p className="mt-1 text-sm leading-5 text-gray-600">{description}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </PageSection>
        );
    };

    const renderSettings = () => (
        <PageSection className="xl:grid-cols-2">
            <article data-mitra-tour="mitra-onboarding-settings" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CheckCircle2 className="h-5 w-5 text-red-600" />
                    Onboarding Anggota
                </h2>
                <div className="mt-4 space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="onboarding-title">Judul</Label>
                        <Input id="onboarding-title" placeholder="Selamat datang di Program Wellbeing" value={onboardingDraft.title} onChange={(event) => setOnboardingDraft((prev) => ({ ...prev, title: event.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="onboarding-message">Pesan sambutan</Label>
                        <Textarea id="onboarding-message" placeholder="Halo, kamu sudah terdaftar dalam program wellbeing organisasi. Mulai dari cek mood dan sesi refleksi singkat hari ini." value={onboardingDraft.welcome_message} onChange={(event) => setOnboardingDraft((prev) => ({ ...prev, welcome_message: event.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="onboarding-checklist">Checklist</Label>
                        <Textarea id="onboarding-checklist" placeholder={"Lengkapi profil pribadi\nCoba chat refleksi pertama\nSelesaikan breathing session 3 menit"} value={onboardingDraft.checklist} onChange={(event) => setOnboardingDraft((prev) => ({ ...prev, checklist: event.target.value }))} />
                    </div>
                    <Button type="button" onClick={handleSaveOnboarding} disabled={isSubmitting}>Simpan Onboarding</Button>
                </div>
            </article>

            <article data-mitra-tour="mitra-reminder-settings" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <RefreshCw className="h-5 w-5 text-red-600" />
                    Pengingat Operasional
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Jalankan pengecekan reminder kontrak, utilisasi seat, dan tindak lanjut anggota.
                </p>
                <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                        <p className="text-sm font-semibold text-red-900">Reminder aktif untuk organisasi terpilih</p>
                        <p className="mt-1 text-xs leading-5 text-red-800">
                            Sistem akan menyiapkan reminder berdasarkan status subscription, penggunaan seat, dan approval anggota.
                        </p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleRunReminders} disabled={isSubmitting}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Jalankan Pengingat
                    </Button>
                </div>
            </article>
        </PageSection>
    );

    const renderPageContent = () => {
        if (!hasOrganizations) return renderNoOrganizationState();

        switch (initialSection) {
            case "organizations":
                return renderOrganizations();
            case "subscription":
                return renderSubscription();
            case "insights":
                return renderInsights();
            case "payments":
                return renderPayments();
            case "settings":
                return renderSettings();
            case "overview":
            default:
                return renderOverview();
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto min-h-screen w-full max-w-[112rem] space-y-6 bg-gradient-to-br from-gray-50 via-white to-red-50/40 p-3 xs:p-4 lg:p-6">
                <div className="h-32 animate-pulse rounded-2xl border border-red-100 bg-red-50/70" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-100 bg-white" />
                    ))}
                </div>
                <div className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white" />
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen w-full max-w-[112rem] space-y-6 bg-gradient-to-br from-gray-50 via-white to-red-50/40 p-3 xs:p-4 lg:p-6">
            {renderHeader()}

            {errorMessage && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errorMessage}
                </div>
            )}

            {renderPageContent()}
        </div>
    );
}
