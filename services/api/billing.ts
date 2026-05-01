import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type {
  BillingCatalog,
  BillingCheckoutPayload,
  BillingCheckoutResponse,
  BillingStatus,
  BillingTransactionList,
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
};
