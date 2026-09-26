"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminBillingService } from "@/services/api";
import type {
  AdminPremiumPlanPayload,
  AdminTopupPackagePayload,
} from "@/services/api/billing";
import type {
  BillingPremiumPlan,
  BillingTopupPackage,
  BillingTransaction,
} from "@/types";

type Tab = "transactions" | "plans" | "topups";

export function useAdminBilling() {
  const { user, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("transactions");

  // Transactions
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txStatus, setTxStatus] = useState<string>("all");
  const [txItemType, setTxItemType] = useState<string>("all");

  // Plans & topups
  const [plans, setPlans] = useState<BillingPremiumPlan[]>([]);
  const [topups, setTopups] = useState<BillingTopupPackage[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await adminBillingService.getTransactions(token, {
        page: txPage,
        limit: 20,
        status: txStatus === "all" ? undefined : txStatus,
        item_type: txItemType === "all" ? undefined : txItemType,
      });
      const data = (res as { data: { transactions: BillingTransaction[]; total_pages: number } }).data;
      setTransactions(data?.transactions || []);
      setTxTotalPages(data?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, txPage, txStatus, txItemType]);

  const loadPlans = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await adminBillingService.getPlans(token, false);
      setPlans((res as { data: BillingPremiumPlan[] }).data || []);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadTopups = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await adminBillingService.getTopupPackages(token, false);
      setTopups((res as { data: BillingTopupPackage[] }).data || []);
    } catch (error) {
      console.error("Failed to load topup packages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "transactions") loadTransactions();
    else if (activeTab === "plans") loadPlans();
    else loadTopups();
  }, [activeTab, loadTransactions, loadPlans, loadTopups]);

  const savePlan = useCallback(
    async (payload: AdminPremiumPlanPayload, id?: number) => {
      if (!token) return;
      setIsSaving(true);
      try {
        if (id) await adminBillingService.updatePlan(token, id, payload);
        else await adminBillingService.createPlan(token, payload);
        await loadPlans();
      } catch (error) {
        console.error("Failed to save plan:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [token, loadPlans]
  );

  const saveTopup = useCallback(
    async (payload: AdminTopupPackagePayload, id?: number) => {
      if (!token) return;
      setIsSaving(true);
      try {
        if (id) await adminBillingService.updateTopupPackage(token, id, payload);
        else await adminBillingService.createTopupPackage(token, payload);
        await loadTopups();
      } catch (error) {
        console.error("Failed to save topup package:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [token, loadTopups]
  );

  const exportCsv = useCallback(async () => {
    if (!token) return;
    try {
      await adminBillingService.exportTransactionsCSV(token, {
        status: txStatus === "all" ? undefined : txStatus,
        item_type: txItemType === "all" ? undefined : txItemType,
      });
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  }, [token, txStatus, txItemType]);

  return {
    user,
    activeTab,
    setActiveTab,
    transactions,
    txPage,
    txTotalPages,
    txStatus,
    txItemType,
    setTxPage,
    setTxStatus,
    setTxItemType,
    plans,
    topups,
    isLoading,
    isSaving,
    savePlan,
    saveTopup,
    exportCsv,
  };
}
