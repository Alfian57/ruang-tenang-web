export type CheckoutItemType = "subscription" | "topup";

export interface BillingPremiumPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  is_active: boolean;
}

export interface BillingTopupPackage {
  id: number;
  code: string;
  name: string;
  coins: number;
  bonus_coins: number;
  total_coins: number;
  price: number;
  is_active: boolean;
}

export interface BillingBusinessPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  billing_cycle: "monthly" | "yearly" | string;
  base_price_per_seat: number;
  min_seats: number;
  max_seats: number;
  features?: Record<string, unknown>;
  is_active: boolean;
}

export interface BillingChatQuota {
  feature_key: string;
  limit: number;
  used: number;
  remaining: number;
  is_unlimited: boolean;
  reset_at: string;
}

export interface BillingCatalog {
  plans: BillingPremiumPlan[];
  topup_packages: BillingTopupPackage[];
  business_plans: BillingBusinessPlan[];
  chat_quota: BillingChatQuota;
}

export interface BillingSubscriptionInfo {
  plan_id: number;
  plan_code: string;
  plan_name: string;
  status: string;
  starts_at: string;
  ends_at: string;
  source_order_id: string;
}

export interface BillingStatus {
  is_premium: boolean;
  entitlement_source?: "free" | "personal" | "b2b" | string;
  b2b_organization_id?: number;
  premium_since?: string;
  premium_expires_at?: string;
  gold_coins: number;
  chat_quota: BillingChatQuota;
  subscription?: BillingSubscriptionInfo;
}

export interface BillingCheckoutPayload {
  item_type: CheckoutItemType;
  item_id: number;
}

export interface BillingCheckoutResponse {
  transaction_id: number;
  order_id: string;
  item_type: CheckoutItemType;
  item_id: number;
  item_name: string;
  amount: number;
  currency: string;
  status: string;
  snap_token: string;
  snap_url: string;
  expires_at?: string;
}

export interface BillingTransaction {
  id: number;
  order_id: string;
  user_id: number;
  item_type: string;
  item_id: number;
  item_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_provider: string;
  provider_transaction_id?: string;
  provider_payment_type?: string;
  failure_reason?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingTransactionList {
  transactions: BillingTransaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
