"use client";

import { useAuthStore } from "@/store/authStore";
import { AdminDashboard } from "./_components/AdminDashboard";
import { MemberDashboard } from "./_components/MemberDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Check if user is admin
  // user?.role might be undefined initially, but auth protection usually handles this
  const isAdminOrMod = user?.role === "admin" || user?.role === "moderator";

  if (isAdminOrMod) {
    return <AdminDashboard />;
  }

  return <MemberDashboard />;
}
