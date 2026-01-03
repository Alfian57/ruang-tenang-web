"use client";

import { useAuthStore } from "@/stores/authStore";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Check if user is admin
  // user?.role might be undefined initially, but auth protection usually handles this
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <MemberDashboard />;
}
