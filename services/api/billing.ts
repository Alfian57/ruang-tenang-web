import { httpClient } from "@/services/http/client";
import { env } from "@/config/env";
import type { ApiResponse } from "@/services/http/types";
import type {
  BillingCatalog,
  BillingCheckoutPayload,
  BillingCheckoutResponse,
  BillingStatus,
  BillingTransactionList,
  BillingPremiumPlan,
  BillingTopupPackage,
} from "@/types";

export const billingService = {
  getCatalog(token: string) {
    return httpClient.get<ApiResponse<BillingCatalog>>("/billing/catalog", { token });
  },

  getStatus(token: string) {
    return httpClient.get<ApiResponse<BillingStatus>>("/billing/status", { token });
  },

  createCheckout(token: string, payload: BillingCheckoutPayload) {
    return httpClient.post<ApiResponse<BillingCheckoutResponse>>("/billing/checkout", payload, { token });
  },

  getTransactions(token: string, params?: { page?: number; limit?: number; status?: string; item_type?: string }) {
    return httpClient.get<ApiResponse<BillingTransactionList>>("/billing/transactions", {
      token,
      params,
    });
  },

  /// Unduh CSV riwayat transaksi (menghormati filter status/item_type).
  /// Endpoint mengembalikan file CSV (bukan JSON), jadi diunduh via fetch langsung.
  async exportTransactionsCSV(token: string, params?: { status?: string; item_type?: string }) {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.item_type) search.set("item_type", params.item_type);
    const query = search.toString();
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/billing/transactions/export${query ? `?${query}` : ""}`;
    return downloadCsv(url, token, "riwayat_transaksi.csv");
  },

  /// Unduh CSV satu invoice berdasarkan order ID.
  async downloadInvoice(token: string, orderId: string) {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/billing/transactions/${encodeURIComponent(orderId)}/invoice`;
    return downloadCsv(url, token, `invoice_${orderId}.csv`);
  },
};

// ====================================================================
// Admin billing management (requires admin role).
// ====================================================================
export const adminBillingService = {
  getTransactions(
    token: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      item_type?: string;
      refund_reconciliation_status?: string;
      user_id?: number;
    }
  ) {
    return httpClient.get<ApiResponse<BillingTransactionList>>("/admin/billing/transactions", {
      token,
      params,
    });
  },

  requestRefund(token: string, orderId: string, data: AdminRefundPayload) {
    return httpClient.post<ApiResponse<AdminRefundResponse>>(
      `/admin/billing/transactions/${encodeURIComponent(orderId)}/refunds`,
      data,
      { token }
    );
  },

  syncRefundStatus(token: string, orderId: string) {
    return httpClient.post<ApiResponse<null>>(
      `/admin/billing/transactions/${encodeURIComponent(orderId)}/refund-status/sync`,
      {},
      { token }
    );
  },

  reconcileRefund(token: string, orderId: string, data: AdminRefundReconciliationPayload) {
    return httpClient.post<ApiResponse<AdminRefundReconciliationResponse>>(
      `/admin/billing/transactions/${encodeURIComponent(orderId)}/refund-reconciliation`,
      data,
      { token }
    );
  },

  async exportTransactionsCSV(
    token: string,
    params?: { status?: string; item_type?: string; user_id?: number }
  ) {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.item_type) search.set("item_type", params.item_type);
    if (params?.user_id) search.set("user_id", String(params.user_id));
    const query = search.toString();
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/admin/billing/transactions/export${query ? `?${query}` : ""}`;
    return downloadCsv(url, token, "transaksi_admin.csv");
  },

  // Premium plans
  getPlans(token: string, activeOnly = false) {
    return httpClient.get<ApiResponse<BillingPremiumPlan[]>>("/admin/billing/plans", {
      token,
      params: { active_only: activeOnly },
    });
  },

  createPlan(token: string, data: AdminPremiumPlanPayload) {
    return httpClient.post<ApiResponse<BillingPremiumPlan>>("/admin/billing/plans", data, { token });
  },

  updatePlan(token: string, id: number, data: AdminPremiumPlanPayload) {
    return httpClient.put<ApiResponse<BillingPremiumPlan>>(`/admin/billing/plans/${id}`, data, { token });
  },

  // Topup packages
  getTopupPackages(token: string, activeOnly = false) {
    return httpClient.get<ApiResponse<BillingTopupPackage[]>>("/admin/billing/topup-packages", {
      token,
      params: { active_only: activeOnly },
    });
  },

  createTopupPackage(token: string, data: AdminTopupPackagePayload) {
    return httpClient.post<ApiResponse<BillingTopupPackage>>("/admin/billing/topup-packages", data, { token });
  },

  updateTopupPackage(token: string, id: number, data: AdminTopupPackagePayload) {
    return httpClient.put<ApiResponse<BillingTopupPackage>>(`/admin/billing/topup-packages/${id}`, data, { token });
  },
};

export interface AdminPremiumPlanPayload {
  code: string;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  is_active?: boolean;
}

export interface AdminTopupPackagePayload {
  code: string;
  name: string;
  coins: number;
  bonus_coins?: number;
  price: number;
  is_active?: boolean;
}

export interface AdminRefundPayload {
  amount: number;
  reason: string;
}

export type AdminRefundReconciliationAction =
  | "deduct_remaining_coins"
  | "accept_consumed_coins"
  | "revoke_premium_days"
  | "revoke_refunded_subscription"
  | "retain_entitlement"
  | "mark_refund_rejected"
  | "complete_manual_review";

export interface AdminRefundReconciliationPayload {
  action: AdminRefundReconciliationAction;
  premium_days_to_revoke?: number;
  provider_rejection_confirmed?: boolean;
  manual_review_confirmed?: boolean;
  note: string;
}

export interface AdminRefundResponse {
  order_id: string;
  refund_key: string;
  amount: number;
  status: string;
  message: string;
}

export interface AdminRefundReconciliationResponse {
  order_id: string;
  refund_reconciliation_status: string;
  refund_reconciliation_reason: string;
  coins_reversed: number;
  coins_written_off: number;
  premium_days_reduced: number;
}

/// Helper: ambil CSV dengan Authorization lalu picu unduhan di browser.
async function downloadCsv(url: string, token: string, fallbackName: string): Promise<void> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Gagal mengunduh file");
  }

  // Ambil nama file dari header Content-Disposition bila tersedia.
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename=([^;]+)/i);
  const filename = match ? match[1].trim().replace(/"/g, "") : fallbackName;

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
