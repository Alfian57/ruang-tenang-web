"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Download, Pencil, CreditCard, Wallet, Receipt } from "lucide-react";
import { formatDate } from "@/utils";
import { Pagination } from "@/components/ui/pagination";
import { useAdminBilling } from "./_hooks/useAdminBilling";
import type { AdminPremiumPlanPayload, AdminTopupPackagePayload } from "@/services/api/billing";
import type { BillingPremiumPlan, BillingTopupPackage } from "@/types";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}

const TX_STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "muted"> = {
  paid: "success",
  settlement: "success",
  pending: "warning",
  failed: "destructive",
  expired: "destructive",
  cancelled: "muted",
};

export default function AdminBillingPage() {
  const {
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
  } = useAdminBilling();

  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPremiumPlan | null>(null);
  const [planForm, setPlanForm] = useState<AdminPremiumPlanPayload>({
    code: "",
    name: "",
    description: "",
    price: 0,
    duration_days: 30,
    is_active: true,
  });

  const [topupDialog, setTopupDialog] = useState(false);
  const [editingTopup, setEditingTopup] = useState<BillingTopupPackage | null>(null);
  const [topupForm, setTopupForm] = useState<AdminTopupPackagePayload>({
    code: "",
    name: "",
    coins: 0,
    bonus_coins: 0,
    price: 0,
    is_active: true,
  });

  if (user?.role !== "admin") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  const openPlanDialog = (plan?: BillingPremiumPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration_days: plan.duration_days,
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({ code: "", name: "", description: "", price: 0, duration_days: 30, is_active: true });
    }
    setPlanDialog(true);
  };

  const openTopupDialog = (pkg?: BillingTopupPackage) => {
    if (pkg) {
      setEditingTopup(pkg);
      setTopupForm({
        code: pkg.code,
        name: pkg.name,
        coins: pkg.coins,
        bonus_coins: pkg.bonus_coins,
        price: pkg.price,
        is_active: pkg.is_active,
      });
    } else {
      setEditingTopup(null);
      setTopupForm({ code: "", name: "", coins: 0, bonus_coins: 0, price: 0, is_active: true });
    }
    setTopupDialog(true);
  };

  const handleSavePlan = async () => {
    try {
      await savePlan(planForm, editingPlan?.id);
      setPlanDialog(false);
    } catch {
      /* logged in hook */
    }
  };

  const handleSaveTopup = async () => {
    try {
      await saveTopup(topupForm, editingTopup?.id);
      setTopupDialog(false);
    } catch {
      /* logged in hook */
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Billing</h1>
        <p className="text-gray-500">Pantau transaksi serta kelola paket premium dan paket koin</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">
            <Receipt className="w-4 h-4 mr-2" /> Transaksi
          </TabsTrigger>
          <TabsTrigger value="plans">
            <CreditCard className="w-4 h-4 mr-2" /> Paket Premium
          </TabsTrigger>
          <TabsTrigger value="topups">
            <Wallet className="w-4 h-4 mr-2" /> Paket Koin
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                className="admin-select"
                value={txStatus}
                onChange={(e) => { setTxStatus(e.target.value); setTxPage(1); }}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                className="admin-select"
                value={txItemType}
                onChange={(e) => { setTxItemType(e.target.value); setTxPage(1); }}
              >
                <option value="all">Semua Jenis</option>
                <option value="subscription">Subscription</option>
                <option value="topup">Topup</option>
              </select>
            </div>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" /> Ekspor CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3 font-medium">Order ID</th>
                    <th className="p-3 font-medium">Item</th>
                    <th className="p-3 font-medium">Jumlah</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Memuat...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Tidak ada transaksi</td></tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-muted/40">
                        <td className="p-3 font-mono text-xs">{tx.order_id}</td>
                        <td className="p-3">
                          <div className="font-medium">{tx.item_name}</div>
                          <div className="text-xs text-muted-foreground">{tx.item_type}</div>
                        </td>
                        <td className="p-3">{formatIDR(tx.amount)}</td>
                        <td className="p-3">
                          <Badge variant={TX_STATUS_VARIANT[tx.status] || "muted"}>{tx.status}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{formatDate(tx.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Pagination currentPage={txPage} totalPages={txTotalPages} onPageChange={setTxPage} />
        </TabsContent>

        {/* Premium plans */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openPlanDialog()} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Tambah Paket
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p className="text-muted-foreground">Memuat...</p>
            ) : plans.length === 0 ? (
              <p className="text-muted-foreground">Belum ada paket premium.</p>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id} className="flex flex-col h-full">
                  <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{plan.code}</p>
                      </div>
                      <Badge variant={plan.is_active ? "success" : "muted"}>
                        {plan.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                    <p className="font-bold">{formatIDR(plan.price)}</p>
                    <p className="text-xs text-muted-foreground">{plan.duration_days} hari</p>
                    <Button variant="outline" size="sm" onClick={() => openPlanDialog(plan)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Topup packages */}
        <TabsContent value="topups" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openTopupDialog()} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Tambah Paket Koin
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p className="text-muted-foreground">Memuat...</p>
            ) : topups.length === 0 ? (
              <p className="text-muted-foreground">Belum ada paket koin.</p>
            ) : (
              topups.map((pkg) => (
                <Card key={pkg.id} className="flex flex-col h-full">
                  <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{pkg.code}</p>
                      </div>
                      <Badge variant={pkg.is_active ? "success" : "muted"}>
                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      {pkg.coins} koin
                      {pkg.bonus_coins > 0 && (
                        <span className="text-green-600"> + {pkg.bonus_coins} bonus</span>
                      )}
                    </p>
                    <p className="font-bold">{formatIDR(pkg.price)}</p>
                    <Button variant="outline" size="sm" onClick={() => openTopupDialog(pkg)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan dialog */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Paket Premium" : "Tambah Paket Premium"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input label="Kode" value={planForm.code} onChange={(e) => setPlanForm((p) => ({ ...p, code: e.target.value }))} required />
            <Input label="Nama" value={planForm.name} onChange={(e) => setPlanForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Deskripsi" value={planForm.description} onChange={(e) => setPlanForm((p) => ({ ...p, description: e.target.value }))} />
            <Input label="Harga (IDR)" type="number" value={planForm.price} onChange={(e) => setPlanForm((p) => ({ ...p, price: Number(e.target.value) }))} required />
            <Input label="Durasi (hari)" type="number" value={planForm.duration_days} onChange={(e) => setPlanForm((p) => ({ ...p, duration_days: Number(e.target.value) }))} required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={planForm.is_active} onChange={(e) => setPlanForm((p) => ({ ...p, is_active: e.target.checked }))} />
              Aktif
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog(false)}>Batal</Button>
            <Button onClick={handleSavePlan} disabled={isSaving}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topup dialog */}
      <Dialog open={topupDialog} onOpenChange={setTopupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTopup ? "Edit Paket Koin" : "Tambah Paket Koin"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input label="Kode" value={topupForm.code} onChange={(e) => setTopupForm((p) => ({ ...p, code: e.target.value }))} required />
            <Input label="Nama" value={topupForm.name} onChange={(e) => setTopupForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Jumlah Koin" type="number" value={topupForm.coins} onChange={(e) => setTopupForm((p) => ({ ...p, coins: Number(e.target.value) }))} required />
            <Input label="Bonus Koin" type="number" value={topupForm.bonus_coins} onChange={(e) => setTopupForm((p) => ({ ...p, bonus_coins: Number(e.target.value) }))} />
            <Input label="Harga (IDR)" type="number" value={topupForm.price} onChange={(e) => setTopupForm((p) => ({ ...p, price: Number(e.target.value) }))} required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={topupForm.is_active} onChange={(e) => setTopupForm((p) => ({ ...p, is_active: e.target.checked }))} />
              Aktif
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopupDialog(false)}>Batal</Button>
            <Button onClick={handleSaveTopup} disabled={isSaving}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
