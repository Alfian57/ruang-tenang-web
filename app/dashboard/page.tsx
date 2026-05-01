"use client";

import { useAuthStore } from "@/store/authStore";
import { AdminDashboard } from "./_components/AdminDashboard";
import { MemberDashboard } from "./_components/MemberDashboard";
import { MitraDashboard } from "./_components/MitraDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.role === "mitra") {
    return <MitraDashboard />;
  }

  return <MemberDashboard />;
}
