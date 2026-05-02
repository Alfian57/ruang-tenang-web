"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart3, CreditCard, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { useMitraDashboard } from "../../_hooks/useMitraDashboard";
import {
  buildUtilizationTrend,
  formatBillingCycle,
  formatCurrency,
  getDaysUntil,
  getMemberStatusCounts,
  getSeatUsagePercent,
  getTotalMessages,
  PAGE_META,
  type MitraDashboardSection,
} from "../mitra-dashboard-utils";

export function useMitraDashboardViewModel(initialSection: MitraDashboardSection) {
  const {
    user,
    organizations,
    plans,
    summary,
    members,
    analytics,
    impactReport,
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
  const impactMetrics = impactReport?.metrics ?? [];
  const impactEngagement = impactReport?.engagement;
  const impactSubscription = impactReport?.subscription;
  const utilizationTrend = useMemo(() => buildUtilizationTrend(analytics), [analytics]);
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

  const subscriptionStateLabel = hasActiveSubscription
    ? `${subscription?.plan_name} - ${formatBillingCycle(subscription?.billing_cycle)}`
    : "Belum ada langganan aktif";

  const seatUsageTone: "red" | "amber" | "rose" = seatUsagePercent >= 90
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

  return {
    initialSection,
    organizations,
    plans,
    summary,
    members,
    analytics,
    impactReport,
    auditLogs,
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
    showCreateForm,
    setShowCreateForm,
    organizationForm,
    setOrganizationForm,
    inviteForm,
    setInviteForm,
    bulkInviteText,
    setBulkInviteText,
    quoteForm,
    setQuoteForm,
    upgradeForm,
    setUpgradeForm,
    onboardingDraft,
    setOnboardingDraft,
    activePlans,
    selectedQuotePlan,
    seatUsage,
    seatUsagePercent,
    subscription,
    pendingMembers,
    selectedOrganization,
    selectedOrganizationName,
    hasOrganizations,
    hasActiveSubscription,
    totalMessages,
    impactMetrics,
    impactEngagement,
    impactSubscription,
    utilizationTrend,
    latestTrendPoint,
    utilizationDelta,
    averageUtilization,
    peakUtilization,
    peakMessages,
    memberStatusCounts,
    daysUntilRenewal,
    pageMeta,
    subscriptionStateLabel,
    seatUsageTone,
    workflowLinks,
    handleQuotePlanChange,
    handleCreateOrganization,
    handleInviteMember,
    handleBulkInvite,
    handleCopyInviteLink,
    handleCreateQuote,
    handleUpgradeSeats,
    handleSaveOnboarding,
    handleRunReminders,
    handleApproveMember,
    handleRejectMember,
    handleRemoveMember,
  };
}

export type MitraDashboardViewModel = ReturnType<typeof useMitraDashboardViewModel>;
