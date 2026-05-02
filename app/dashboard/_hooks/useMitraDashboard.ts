"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { b2bService } from "@/services/api";
import { ApiError } from "@/services/http/types";
import { useAuthStore } from "@/store/authStore";
import type {
  B2BAuditLog,
  B2BBulkInviteResponse,
  B2BImpactReport,
  B2BInviteMemberResponse,
  B2BOnboardingTemplate,
  B2BOrganizationAnalytics,
  B2BOrganizationMember,
  B2BOrganizationSummary,
  B2BPlan,
  B2BPricingRecommendation,
  B2BQuote,
  B2BQuoteRequest,
  B2BSeatUpgradeRequest,
  CreateB2BOrganizationRequest,
  InviteB2BMemberRequest,
  MitraOrganizationListItem,
} from "@/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan saat memuat data mitra.";
}

function buildInviteLink(token: string) {
  if (typeof window === "undefined") return `/b2b/invite?token=${encodeURIComponent(token)}`;
  return `${window.location.origin}/b2b/invite?token=${encodeURIComponent(token)}`;
}

export function useMitraDashboard() {
  const { token, user } = useAuthStore();

  const [organizations, setOrganizations] = useState<MitraOrganizationListItem[]>([]);
  const [plans, setPlans] = useState<B2BPlan[]>([]);
  const [summary, setSummary] = useState<B2BOrganizationSummary | null>(null);
  const [members, setMembers] = useState<B2BOrganizationMember[]>([]);
  const [analytics, setAnalytics] = useState<B2BOrganizationAnalytics | null>(null);
  const [impactReport, setImpactReport] = useState<B2BImpactReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<B2BAuditLog[]>([]);
  const [onboardingTemplate, setOnboardingTemplate] = useState<B2BOnboardingTemplate | null>(null);
  const [pricingRecommendation, setPricingRecommendation] = useState<B2BPricingRecommendation | null>(null);
  const [lastInvite, setLastInvite] = useState<{ response: B2BInviteMemberResponse; link: string } | null>(null);
  const [bulkInviteResult, setBulkInviteResult] = useState<B2BBulkInviteResponse | null>(null);
  const [lastQuote, setLastQuote] = useState<B2BQuote | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBaseData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [organizationRes, planRes] = await Promise.all([
        b2bService.listOrganizations(token),
        b2bService.listPlans(token),
      ]);

      const organizationItems = organizationRes.data ?? [];
      setOrganizations(organizationItems);
      setPlans(planRes.data ?? []);

      setSelectedOrganizationId((current) => {
        if (current && organizationItems.some((item) => item.organization.id === current)) {
          return current;
        }
        return organizationItems[0]?.organization.id ?? null;
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setOrganizations([]);
      setPlans([]);
      setSelectedOrganizationId(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadOrganizationDetail = useCallback(async (organizationId: number) => {
    if (!token) return;

    setIsLoadingDetail(true);
    setErrorMessage(null);

    try {
      const [summaryRes, membersRes, analyticsRes, impactRes, auditRes, onboardingRes, pricingRes] = await Promise.all([
        b2bService.getOrganizationSummary(token, organizationId),
        b2bService.listOrganizationMembers(token, organizationId),
        b2bService.getOrganizationAnalytics(token, organizationId, 30),
        b2bService.getImpactReport(token, organizationId, 30).catch(() => null),
        b2bService.listAuditLogs(token, organizationId, { limit: 12 }),
        b2bService.getOnboardingTemplate(token, organizationId, "member"),
        b2bService.getPricingRecommendation(token, organizationId).catch(() => null),
      ]);

      setSummary(summaryRes.data ?? null);
      setMembers(membersRes.data ?? []);
      setAnalytics(analyticsRes.data ?? null);
      setImpactReport(impactRes?.data ?? null);
      setAuditLogs(auditRes.data?.items ?? []);
      setOnboardingTemplate(onboardingRes.data ?? null);
      setPricingRecommendation(pricingRes?.data ?? null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSummary(null);
      setMembers([]);
      setAnalytics(null);
      setImpactReport(null);
      setAuditLogs([]);
      setOnboardingTemplate(null);
      setPricingRecommendation(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [token]);

  const refreshSelectedOrganization = useCallback(async () => {
    if (selectedOrganizationId) {
      await loadOrganizationDetail(selectedOrganizationId);
    }
  }, [loadOrganizationDetail, selectedOrganizationId]);

  const runMutation = useCallback(async <T,>(fn: () => Promise<T>, refresh = true) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await fn();
      if (refresh) await refreshSelectedOrganization();
      return result;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshSelectedOrganization]);

  const createOrganization = useCallback(async (payload: CreateB2BOrganizationRequest) => {
    if (!token) throw new Error("Sesi login tidak tersedia.");
    await runMutation(async () => {
      await b2bService.createOrganization(token, payload);
      await loadBaseData();
    }, false);
  }, [token, loadBaseData, runMutation]);

  const inviteMember = useCallback(async (payload: InviteB2BMemberRequest) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    const response = await runMutation(() => b2bService.inviteMember(token, selectedOrganizationId, payload));
    const invite = response.data;
    if (invite) {
      setLastInvite({ response: invite, link: buildInviteLink(invite.invitation_token) });
    }
  }, [token, selectedOrganizationId, runMutation]);

  const bulkInviteMembers = useCallback(async (membersPayload: InviteB2BMemberRequest[]) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    const response = await runMutation(() => b2bService.bulkInviteMembers(token, selectedOrganizationId, membersPayload));
    setBulkInviteResult(response.data ?? null);
  }, [token, selectedOrganizationId, runMutation]);

  const approveMember = useCallback((memberId: number, note?: string) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    return runMutation(() => b2bService.approveMember(token, selectedOrganizationId, memberId, note));
  }, [token, selectedOrganizationId, runMutation]);

  const rejectMember = useCallback((memberId: number, note?: string) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    return runMutation(() => b2bService.rejectMember(token, selectedOrganizationId, memberId, note));
  }, [token, selectedOrganizationId, runMutation]);

  const removeMember = useCallback((memberId: number) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    return runMutation(() => b2bService.removeMember(token, selectedOrganizationId, memberId));
  }, [token, selectedOrganizationId, runMutation]);

  const createQuote = useCallback(async (payload: B2BQuoteRequest) => {
    if (!token) throw new Error("Sesi login tidak tersedia.");
    const response = await runMutation(() => b2bService.createQuote(token, payload), false);
    setLastQuote(response.data ?? null);
  }, [token, runMutation]);

  const upgradeSeats = useCallback((payload: B2BSeatUpgradeRequest) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    return runMutation(() => b2bService.upgradeSeats(token, selectedOrganizationId, payload));
  }, [token, selectedOrganizationId, runMutation]);

  const saveOnboardingTemplate = useCallback((payload: Partial<B2BOnboardingTemplate>) => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    return runMutation(() => b2bService.upsertOnboardingTemplate(token, selectedOrganizationId, payload));
  }, [token, selectedOrganizationId, runMutation]);

  const runReminders = useCallback(() => {
    if (!token || !selectedOrganizationId) throw new Error("Organisasi belum dipilih.");
    return runMutation(() => b2bService.runReminders(token, selectedOrganizationId));
  }, [token, selectedOrganizationId, runMutation]);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  useEffect(() => {
    setLastInvite(null);
    setBulkInviteResult(null);
    setLastQuote(null);
    if (!selectedOrganizationId) {
      setSummary(null);
      setMembers([]);
      setAnalytics(null);
      setImpactReport(null);
      setAuditLogs([]);
      setOnboardingTemplate(null);
      setPricingRecommendation(null);
      return;
    }

    loadOrganizationDetail(selectedOrganizationId);
  }, [selectedOrganizationId, loadOrganizationDetail]);

  const selectedOrganization = useMemo(
    () => organizations.find((item) => item.organization.id === selectedOrganizationId) ?? null,
    [organizations, selectedOrganizationId]
  );

  return {
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
    selectedOrganization,
    selectedOrganizationId,
    isLoading,
    isLoadingDetail,
    isSubmitting,
    errorMessage,
    setSelectedOrganizationId,
    refresh: loadBaseData,
    refreshSelectedOrganization,
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
  };
}
