"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { env } from "@/config/env";
import { openMidtransCheckout } from "@/lib/midtrans";
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
      const checkout = await billingService.createCheckout(token, payload);
      const opened = await openMidtransCheckout({
        snapToken: checkout.data.snap_token,
        snapUrl: checkout.data.snap_url,
        clientKey: env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
        environment: env.NEXT_PUBLIC_MIDTRANS_ENV,
        callbacks: {
          onSuccess: refreshBillingState,
          onPending: refreshBillingState,
          onError: refreshBillingState,
          onClose: refreshBillingState,
        },
      });

      if (!opened) {
        toast.error("Checkout belum bisa dibuka", {
          description: "Lengkapi NEXT_PUBLIC_MIDTRANS_CLIENT_KEY atau gunakan link pembayaran manual.",
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
