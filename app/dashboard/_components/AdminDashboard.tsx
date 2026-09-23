"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAdminDashboard } from "../_hooks/useAdminDashboard";
import { AdminAlertCards } from "./admin/AdminAlertCards";
import { AdminStatsCards } from "./admin/AdminStatsCards";
import { AdminQuickActions } from "./admin/AdminQuickActions";
import { AdminSummaryCards } from "./admin/AdminSummaryCards";

export function AdminDashboard() {
  const { user, stats, isLoading } = useAdminDashboard();

  return (
    <div className="py-4 lg:py-6">
      {/* Header */}
      <div className="mb-8">
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
          <AdminStatsCards stats={stats} />
          <AdminQuickActions stats={stats} />
          <AdminSummaryCards stats={stats} />
        </>
      )}
    </div>
  );
}
