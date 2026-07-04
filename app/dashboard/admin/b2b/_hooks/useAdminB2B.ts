"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminB2bService } from "@/services/api";
import type { AdminB2BPlanPayload, AdminB2BSubscriptionPayload } from "@/services/api/b2b";
import type { B2BPlan, B2BOrganization } from "@/types";

type Tab = "plans" | "organizations";

export function useAdminB2B() {
  const { user, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("plans");
  const [plans, setPlans] = useState<B2BPlan[]>([]);
  const [organizations, setOrganizations] = useState<B2BOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await adminB2bService.listPlans(token, false);
      setPlans((res as { data: B2BPlan[] }).data || []);
    } catch (error) {
      console.error("Failed to load b2b plans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadOrganizations = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await adminB2bService.listOrganizations(token);
      setOrganizations((res as { data: B2BOrganization[] }).data || []);
    } catch (error) {
      console.error("Failed to load b2b organizations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "plans") loadPlans();
    else loadOrganizations();
  }, [activeTab, loadPlans, loadOrganizations]);

  const savePlan = useCallback(
    async (payload: AdminB2BPlanPayload, id?: number) => {
      if (!token) return;
      setIsSaving(true);
      try {
        if (id) await adminB2bService.updatePlan(token, id, payload);
        else await adminB2bService.createPlan(token, payload);
        await loadPlans();
      } catch (error) {
        console.error("Failed to save b2b plan:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [token, loadPlans]
  );

  const createSubscription = useCallback(
    async (organizationId: number, payload: AdminB2BSubscriptionPayload) => {
      if (!token) return;
      setIsSaving(true);
      try {
        await adminB2bService.createSubscription(token, organizationId, payload);
        await loadOrganizations();
      } catch (error) {
        console.error("Failed to create b2b subscription:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [token, loadOrganizations]
  );

  return {
    user,
    activeTab,
    setActiveTab,
    plans,
    organizations,
    isLoading,
    isSaving,
    savePlan,
    createSubscription,
  };
}
