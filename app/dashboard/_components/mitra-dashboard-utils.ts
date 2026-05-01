import type {
  B2BOrganizationAnalytics,
  B2BOrganizationMember,
  B2BSeatUsage,
} from "@/types";

export type MitraDashboardSection = "overview" | "organizations" | "subscription" | "insights" | "payments" | "settings";

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
