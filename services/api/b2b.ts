import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type {
  B2BPlan,
  MitraOrganizationListItem,
  B2BOrganizationSummary,
  B2BOrganizationMember,
  B2BOrganization,
  CreateB2BOrganizationRequest,
  InviteB2BMemberRequest,
  B2BInviteMemberResponse,
  B2BBulkInviteResponse,
  B2BInvitePreview,
  B2BOrganizationAnalytics,
  B2BAuditLogList,
  B2BQuoteRequest,
  B2BQuote,
  B2BOnboardingTemplate,
  B2BSSOConfig,
  B2BPricingRecommendation,
  B2BSeatUpgradeRequest,
  B2BSubscription,
  B2BImpactReport,
} from "@/types";

export const b2bService = {
  listPlans(token: string, activeOnly = true) {
    return httpClient.get<ApiResponse<B2BPlan[]>>("/b2b/plans", {
      token,
      params: { active_only: activeOnly },
    });
  },

  listOrganizations(token: string) {
    return httpClient.get<ApiResponse<MitraOrganizationListItem[]>>("/b2b/organizations", { token });
  },

  createOrganization(token: string, payload: CreateB2BOrganizationRequest) {
    return httpClient.post<ApiResponse<B2BOrganization>>("/b2b/organizations", payload, { token });
  },

  getOrganizationSummary(token: string, organizationId: number) {
    return httpClient.get<ApiResponse<B2BOrganizationSummary>>(`/b2b/organizations/${organizationId}`, { token });
  },

  listOrganizationMembers(token: string, organizationId: number, status?: string) {
    return httpClient.get<ApiResponse<B2BOrganizationMember[]>>(`/b2b/organizations/${organizationId}/members`, {
      token,
      params: { status },
    });
  },

  inviteMember(token: string, organizationId: number, payload: InviteB2BMemberRequest) {
    return httpClient.post<ApiResponse<B2BInviteMemberResponse>>(
      `/b2b/organizations/${organizationId}/members/invite`,
      payload,
      { token }
    );
  },

  bulkInviteMembers(token: string, organizationId: number, members: InviteB2BMemberRequest[]) {
    return httpClient.post<ApiResponse<B2BBulkInviteResponse>>(
      `/b2b/organizations/${organizationId}/members/bulk-invite`,
      { members },
      { token }
    );
  },

  approveMember(token: string, organizationId: number, memberId: number, note?: string) {
    return httpClient.post<ApiResponse<unknown>>(
      `/b2b/organizations/${organizationId}/members/${memberId}/approve`,
      { note: note ?? "" },
      { token }
    );
  },

  rejectMember(token: string, organizationId: number, memberId: number, note?: string) {
    return httpClient.post<ApiResponse<unknown>>(
      `/b2b/organizations/${organizationId}/members/${memberId}/reject`,
      { note: note ?? "" },
      { token }
    );
  },

  removeMember(token: string, organizationId: number, memberId: number) {
    return httpClient.delete<ApiResponse<unknown>>(`/b2b/organizations/${organizationId}/members/${memberId}`, { token });
  },

  getInvitePreview(token: string, invitationToken: string) {
    return httpClient.get<ApiResponse<B2BInvitePreview>>(`/b2b/invitations/${encodeURIComponent(invitationToken)}`, { token });
  },

  acceptInvite(token: string, invitationToken: string) {
    return httpClient.post<ApiResponse<unknown>>(
      "/b2b/invitations/accept",
      { invitation_token: invitationToken },
      { token }
    );
  },

  getOrganizationAnalytics(token: string, organizationId: number, days = 30) {
    return httpClient.get<ApiResponse<B2BOrganizationAnalytics>>(`/b2b/organizations/${organizationId}/analytics`, {
      token,
      params: { days },
    });
  },

  getImpactReport(token: string, organizationId: number, days = 30) {
    return httpClient.get<ApiResponse<B2BImpactReport>>(`/b2b/organizations/${organizationId}/impact-report`, {
      token,
      params: { days },
    });
  },

  listAuditLogs(token: string, organizationId: number, params?: { page?: number; limit?: number; action?: string }) {
    return httpClient.get<ApiResponse<B2BAuditLogList>>(`/b2b/organizations/${organizationId}/audit-logs`, {
      token,
      params,
    });
  },

  createQuote(token: string, payload: B2BQuoteRequest) {
    return httpClient.post<ApiResponse<B2BQuote>>("/b2b/quotes", payload, { token });
  },

  getOnboardingTemplate(token: string, organizationId: number, role = "member") {
    return httpClient.get<ApiResponse<B2BOnboardingTemplate>>(
      `/b2b/organizations/${organizationId}/onboarding-template`,
      { token, params: { role } }
    );
  },

  upsertOnboardingTemplate(token: string, organizationId: number, payload: Partial<B2BOnboardingTemplate>) {
    return httpClient.put<ApiResponse<B2BOnboardingTemplate>>(
      `/b2b/organizations/${organizationId}/onboarding-template`,
      payload,
      { token }
    );
  },

  upgradeSeats(token: string, organizationId: number, payload: B2BSeatUpgradeRequest) {
    return httpClient.post<ApiResponse<{ subscription: B2BSubscription; seat_usage: unknown }>>(
      `/b2b/organizations/${organizationId}/subscriptions/seat-upgrade`,
      payload,
      { token }
    );
  },

  runReminders(token: string, organizationId: number) {
    return httpClient.post<ApiResponse<unknown>>(`/b2b/organizations/${organizationId}/reminders/run`, {}, { token });
  },

  getSSOConfig(token: string, organizationId: number) {
    return httpClient.get<ApiResponse<B2BSSOConfig>>(`/b2b/organizations/${organizationId}/sso-config`, { token });
  },

  upsertSSOConfig(token: string, organizationId: number, payload: Partial<B2BSSOConfig>) {
    return httpClient.put<ApiResponse<B2BSSOConfig>>(`/b2b/organizations/${organizationId}/sso-config`, payload, { token });
  },

  getPricingRecommendation(token: string, organizationId: number) {
    return httpClient.get<ApiResponse<B2BPricingRecommendation>>(
      `/b2b/organizations/${organizationId}/pricing-recommendation`,
      { token }
    );
  },
};
