export interface B2BOrganization {
  id: number;
  code: string;
  name: string;
  business_type: string;
  contact_email: string;
  status: string;
  requires_member_approval: boolean;
}

export interface MitraOrganizationListItem {
  organization: B2BOrganization;
  member_role: string;
  member_status: string;
}

export interface B2BSeatUsage {
  contracted_seats: number;
  used_seats: number;
  available_seats: number;
}

export interface B2BSubscription {
  id: number;
  organization_id: number;
  plan_id: number;
  plan_code: string;
  plan_name: string;
  status: string;
  contracted_seats: number;
  used_seats: number;
  billing_cycle: string;
  unit_price: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  starts_at: string;
  ends_at: string;
  activated_at?: string;
}

export interface B2BOrganizationSummary {
  organization: B2BOrganization;
  subscription?: B2BSubscription;
  seat_usage: B2BSeatUsage;
}

export interface B2BPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  billing_cycle: string;
  base_price_per_seat: number;
  min_seats: number;
  max_seats: number;
  features?: Record<string, unknown>;
  is_active: boolean;
}

export interface B2BOrganizationMember {
  id: number;
  user_id?: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  invited_at?: string;
  joined_at?: string;
  removed_at?: string;
}

export interface CreateB2BOrganizationRequest {
  name: string;
  code?: string;
  business_type?: string;
  contact_email: string;
}

export interface InviteB2BMemberRequest {
  email: string;
  full_name?: string;
  role?: "admin" | "member";
}

export interface B2BInviteMemberResponse {
  member_id: number;
  email: string;
  invitation_token: string;
  invitation_expires_at?: string;
}

export interface B2BBulkInviteResponse {
  total: number;
  invited: number;
  skipped: number;
  results: Array<{
    email: string;
    status: string;
    message: string;
  }>;
}

export interface B2BInvitePreview {
  organization: B2BOrganization;
  member_id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  expires_at?: string;
  can_accept: boolean;
  message?: string;
}

export interface B2BDailyUsageMetric {
  metric_date: string;
  active_members: number;
  invited_members: number;
  pending_approvals: number;
  contracted_seats: number;
  used_seats: number;
  messages_sent: number;
}

export interface B2BOrganizationAnalytics {
  organization_id: number;
  window_days: number;
  member_status_counts: Record<string, number>;
  seat_usage: B2BSeatUsage;
  seat_utilization_pct: number;
  trend: B2BDailyUsageMetric[];
  generated_at: string;
}

export interface B2BAuditLog {
  id: number;
  actor_user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface B2BAuditLogList {
  items: B2BAuditLog[];
  page: number;
  limit: number;
  total: number;
}

export interface B2BQuoteRequest {
  organization_id?: number;
  plan_id: number;
  requested_seats: number;
  billing_cycle?: "monthly" | "yearly";
  selected_add_ons?: string[];
}

export interface B2BQuote {
  quote_code: string;
  organization_id?: number;
  plan_id: number;
  requested_seats: number;
  billing_cycle: string;
  base_price_per_seat: number;
  gross_amount: number;
  volume_discount_amount: number;
  annual_discount_amount: number;
  add_on_amount: number;
  final_amount: number;
  currency: string;
  valid_until: string;
  selected_add_ons: string[];
  applied_rules: string[];
}

export interface B2BOnboardingTemplate {
  id?: number;
  organization_id: number;
  role: string;
  title: string;
  welcome_message: string;
  checklist: string[];
  is_default: boolean;
  is_active: boolean;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface B2BSSOConfig {
  organization_id: number;
  provider: string;
  issuer_url: string;
  entrypoint_url: string;
  audience: string;
  certificate_pem: string;
  is_enabled: boolean;
  enforce_sso: boolean;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface B2BPricingRecommendation {
  organization_id: number;
  generated_for_date: string;
  recommended_plan_id?: number;
  recommended_billing_cycle: string;
  recommended_seats: number;
  estimated_monthly_cost: number;
  estimated_yearly_saving: number;
  confidence_score: number;
  reasons: string[];
  created_at: string;
}

export interface B2BSeatUpgradeRequest {
  contracted_seats: number;
  billing_cycle?: "monthly" | "yearly";
}
