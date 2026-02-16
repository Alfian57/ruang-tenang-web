"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useAdminDashboard } from "../_hooks/useAdminDashboard";
import { AdminAlertCards } from "./admin/AdminAlertCards";
import { AdminStatsCards } from "./admin/AdminStatsCards";
import { AdminQuickActions } from "./admin/AdminQuickActions";
import { AdminSummaryCards } from "./admin/AdminSummaryCards";

export function AdminDashboard() {
  const { user, isModerator, stats, isLoading } = useAdminDashboard();

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Activity className="w-4 h-4" />
          Admin Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Pantau performa platform dan kelola konten Ruang Tenang
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <>
          <AdminAlertCards stats={stats} />
          <AdminStatsCards stats={stats} isModerator={isModerator} />
          <AdminQuickActions stats={stats} isModerator={isModerator} />
          <AdminSummaryCards stats={stats} isModerator={isModerator} />
        </>
      )}
    </div>
  );
}
