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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Building2, Layers, CreditCard } from "lucide-react";
import { useAdminB2B } from "./_hooks/useAdminB2B";
import type { AdminB2BPlanPayload, AdminB2BSubscriptionPayload } from "@/services/api/b2b";
import type { B2BPlan, B2BOrganization } from "@/types";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}

export default function AdminB2BPage() {
  const {
    user,
    activeTab,
    setActiveTab,
    plans,
    organizations,
    isLoading,
    isSaving,
    savePlan,
    createSubscription,
  } = useAdminB2B();

  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<B2BPlan | null>(null);
  const [planForm, setPlanForm] = useState<AdminB2BPlanPayload>({
    code: "",
    name: "",
    description: "",
    billing_cycle: "monthly",
    base_price_per_seat: 0,
    min_seats: 1,
    max_seats: 100,
    is_active: true,
  });

  const [subDialog, setSubDialog] = useState(false);
  const [subOrg, setSubOrg] = useState<B2BOrganization | null>(null);
  const [subForm, setSubForm] = useState<AdminB2BSubscriptionPayload>({
    plan_id: 0,
    contracted_seats: 1,
    billing_cycle: "monthly",
  });

  if (user?.role !== "admin") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  const openPlanDialog = (plan?: B2BPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        billing_cycle: (plan.billing_cycle as "monthly" | "yearly") || "monthly",
        base_price_per_seat: plan.base_price_per_seat,
        min_seats: plan.min_seats,
        max_seats: plan.max_seats,
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        code: "",
        name: "",
        description: "",
        billing_cycle: "monthly",
        base_price_per_seat: 0,
        min_seats: 1,
        max_seats: 100,
        is_active: true,
      });
    }
    setPlanDialog(true);
  };

  const openSubDialog = (org: B2BOrganization) => {
    setSubOrg(org);
    setSubForm({ plan_id: plans[0]?.id || 0, contracted_seats: 1, billing_cycle: "monthly" });
    setSubDialog(true);
  };

  const handleSavePlan = async () => {
    try {
      await savePlan(planForm, editingPlan?.id);
      setPlanDialog(false);
    } catch {
      /* logged in hook */
    }
  };

  const handleCreateSub = async () => {
    if (!subOrg || !subForm.plan_id) return;
    try {
      await createSubscription(subOrg.id, subForm);
      setSubDialog(false);
    } catch {
      /* logged in hook */
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola B2B</h1>
        <p className="text-gray-500">Kelola paket B2B dan langganan organisasi mitra</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">
            <Layers className="w-4 h-4 mr-2" /> Paket B2B
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building2 className="w-4 h-4 mr-2" /> Organisasi
          </TabsTrigger>
        </TabsList>

        {/* Plans */}
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
              <p className="text-muted-foreground">Belum ada paket B2B.</p>
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
                    <p className="font-bold">{formatIDR(plan.base_price_per_seat)} <span className="text-xs font-normal text-muted-foreground">/ seat / {plan.billing_cycle}</span></p>
                    <p className="text-xs text-muted-foreground">{plan.min_seats}–{plan.max_seats} seat</p>
                    <Button variant="outline" size="sm" onClick={() => openPlanDialog(plan)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Organizations */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3 font-medium">Organisasi</th>
                    <th className="p-3 font-medium">Kode</th>
                    <th className="p-3 font-medium">Tipe</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Memuat...</td></tr>
                  ) : organizations.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Tidak ada organisasi</td></tr>
                  ) : (
                    organizations.map((org) => (
                      <tr key={org.id} className="border-b hover:bg-muted/40">
                        <td className="p-3">
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">{org.contact_email}</div>
                        </td>
                        <td className="p-3 font-mono text-xs">{org.code}</td>
                        <td className="p-3">{org.business_type || "-"}</td>
                        <td className="p-3"><Badge variant="info">{org.status}</Badge></td>
                        <td className="p-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => openSubDialog(org)}>
                            <CreditCard className="w-3.5 h-3.5 mr-1" /> Buat Langganan
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan dialog */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Paket B2B" : "Tambah Paket B2B"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input label="Kode" value={planForm.code} onChange={(e) => setPlanForm((p) => ({ ...p, code: e.target.value }))} required />
            <Input label="Nama" value={planForm.name} onChange={(e) => setPlanForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Deskripsi" value={planForm.description} onChange={(e) => setPlanForm((p) => ({ ...p, description: e.target.value }))} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Siklus Penagihan</label>
              <Select
                value={planForm.billing_cycle}
                onValueChange={(v) => setPlanForm((p) => ({ ...p, billing_cycle: v as "monthly" | "yearly" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input label="Harga per Seat (IDR)" type="number" value={planForm.base_price_per_seat} onChange={(e) => setPlanForm((p) => ({ ...p, base_price_per_seat: Number(e.target.value) }))} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Seat" type="number" value={planForm.min_seats} onChange={(e) => setPlanForm((p) => ({ ...p, min_seats: Number(e.target.value) }))} required />
              <Input label="Max Seat" type="number" value={planForm.max_seats} onChange={(e) => setPlanForm((p) => ({ ...p, max_seats: Number(e.target.value) }))} required />
            </div>
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

      {/* Subscription dialog */}
      <Dialog open={subDialog} onOpenChange={setSubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Langganan {subOrg ? `— ${subOrg.name}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Paket</label>
              <Select
                value={subForm.plan_id ? String(subForm.plan_id) : undefined}
                onValueChange={(v) => setSubForm((p) => ({ ...p, plan_id: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih paket" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={String(plan.id)}>
                      {plan.name} ({plan.billing_cycle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input label="Jumlah Seat" type="number" value={subForm.contracted_seats} onChange={(e) => setSubForm((p) => ({ ...p, contracted_seats: Number(e.target.value) }))} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Siklus Penagihan</label>
              <Select
                value={subForm.billing_cycle}
                onValueChange={(v) => setSubForm((p) => ({ ...p, billing_cycle: v as "monthly" | "yearly" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialog(false)}>Batal</Button>
            <Button onClick={handleCreateSub} disabled={isSaving || !subForm.plan_id}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
