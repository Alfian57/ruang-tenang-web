"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { env } from "@/config/env";
import { openDuitkuCheckout } from "@/lib/duitku";
import { billingService } from "@/services/api";
import { ApiError } from "@/services/http/types";
import type { BillingCheckoutPayload } from "@/types";

interface UseBillingCheckoutOptions {
  token?: string | null;
  onRefresh: () => Promise<void> | void;
  refreshUser: () => Promise<void>;
}

export function useBillingCheckout({
  token,
  onRefresh,
  refreshUser,
}: UseBillingCheckoutOptions) {
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const refreshBillingState = useCallback(() => {
    void Promise.all([Promise.resolve(onRefresh()), refreshUser()]);
  }, [onRefresh, refreshUser]);

  const runCheckout = useCallback(async (payload: BillingCheckoutPayload, label: string) => {
    if (!token) return;

    const nextKey = `${payload.item_type}-${payload.item_id}`;
    setProcessingKey(nextKey);

    try {
      let providerReference = payload.provider_reference;
      let paymentUrl = payload.payment_url;
      if (!providerReference && !paymentUrl) {
         const checkout = await billingService.createCheckout(token, {
           item_type: payload.item_type,
           item_id: payload.item_id,
         });
         providerReference = checkout.data.provider_reference;
         paymentUrl = checkout.data.payment_url;
      }
      const opened = await openDuitkuCheckout({
        providerReference,
        paymentUrl,
        environment: env.NEXT_PUBLIC_DUITKU_ENV,
        callbacks: {
          successEvent: refreshBillingState,
          pendingEvent: refreshBillingState,
          errorEvent: refreshBillingState,
          closeEvent: refreshBillingState,
        },
      });

      if (!opened) {
        toast.error("Checkout belum bisa dibuka", {
          description: "Periksa koneksi lalu coba buka kembali pembayaran.",
        });
        return;
      }

      toast.success(`Checkout ${label} berhasil dibuat`, {
        description: "Status akun akan diperbarui setelah pembayaran diproses.",
      });

      refreshBillingState();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Gagal membuat checkout";
      toast.error("Checkout gagal", { description: message });
    } finally {
      setProcessingKey(null);
    }
  }, [refreshBillingState, token]);

  return {
    processingKey,
    runCheckout,
  };
}
