import type {
  B2BAuditLog,
  B2BOrganizationAnalytics,
  B2BOrganizationMember,
  B2BSeatUsage,
} from "@/types";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  Mail,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type MitraDashboardSection = "overview" | "organizations" | "subscription" | "insights" | "payments" | "settings";

export type PageMeta = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
};

export type UtilizationTrendPoint = {
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

export type AuditLogPresentation = {
  title: string;
  description: string;
  entityLabel: string;
  timeLabel: string;
  fullTimeLabel: string;
  Icon: LucideIcon;
  toneClass: string;
  iconClass: string;
};

export const PAGE_META: Record<MitraDashboardSection, PageMeta> = {
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

export function formatCurrency(value?: number) {
  return `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`;
}

export function getStatusTone(status: string) {
  if (status === "active") return "bg-red-100 text-red-700";
  if (status === "pending_approval") return "bg-amber-100 text-amber-700";
  if (status === "invited") return "bg-rose-100 text-rose-700";
  if (status === "removed") return "bg-gray-100 text-gray-600";
  return "bg-gray-100 text-gray-700";
}

export function getSeatUsagePercent(seatUsage?: B2BSeatUsage) {
  if (!seatUsage || seatUsage.contracted_seats <= 0) return 0;
  return Math.min(100, Math.round((seatUsage.used_seats / seatUsage.contracted_seats) * 100));
}

export function getMemberStatusCounts(
  members: B2BOrganizationMember[],
  initialCounts?: Record<string, number>
) {
  if (members.length === 0) {
    return initialCounts ? { ...initialCounts } : {};
  }

  return members.reduce<Record<string, number>>((acc, member) => {
    const key = member.status || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function getTotalMessages(analytics?: B2BOrganizationAnalytics | null) {
  return (analytics?.trend ?? []).reduce((total, item) => total + item.messages_sent, 0);
}

export function formatBillingCycle(value?: string | null): string {
  if (value === "monthly") return "bulanan";
  if (value === "yearly") return "tahunan";
  return value || "-";
}

export function formatReadableStatus(value?: string | null): string {
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

export function getStatusDotClass(status: string): string {
  if (status === "active") return "bg-red-500";
  if (status === "invited") return "bg-rose-500";
  if (status === "pending_approval") return "bg-amber-500";
  if (status === "removed") return "bg-gray-400";
  return "bg-gray-500";
}

export function getImpactMetricToneClass(tone?: string): string {
  if (tone === "emerald" || tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-800";
  if (tone === "rose") return "border-rose-200 bg-rose-50 text-rose-800";
  if (tone === "sky" || tone === "blue") return "border-sky-200 bg-sky-50 text-sky-800";
  if (tone === "violet") return "border-violet-200 bg-violet-50 text-violet-800";
  if (tone === "gray") return "border-gray-200 bg-gray-50 text-gray-700";
  return "border-red-100 bg-red-50 text-red-800";
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value?: string | null): string {
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

export function getDaysUntil(value?: string | null): number | null {
  if (!value) return null;
  const target = new Date(value).getTime();
  if (!Number.isFinite(target)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today.getTime()) / 86_400_000);
}

export function buildUtilizationTrend(analytics?: B2BOrganizationAnalytics | null): UtilizationTrendPoint[] {
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

export function getAuditLogPresentation(log: B2BAuditLog): AuditLogPresentation {
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
