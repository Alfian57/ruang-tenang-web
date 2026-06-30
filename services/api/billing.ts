import { httpClient } from "@/services/http/client";
import { env } from "@/config/env";
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
