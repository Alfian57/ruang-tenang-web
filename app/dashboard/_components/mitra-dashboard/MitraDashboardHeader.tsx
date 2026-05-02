import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraDashboardHeaderProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraDashboardHeader({ viewModel }: MitraDashboardHeaderProps) {
  const PageIcon = viewModel.pageMeta.icon;

  return (
    <section data-mitra-tour="mitra-header" className="relative min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-700">
            <PageIcon className="h-4 w-4" />
            {viewModel.pageMeta.eyebrow}
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-950 xs:text-2xl lg:text-3xl">{viewModel.pageMeta.title}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">{viewModel.pageMeta.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-red-700">
            <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1">{viewModel.organizations.length} organisasi</span>
            <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1">{viewModel.seatUsage?.used_seats ?? 0} seat aktif</span>
            <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1">{viewModel.pendingMembers.length} approval pending</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={viewModel.selectedOrganizationId ? String(viewModel.selectedOrganizationId) : ""}
            onValueChange={(value) => viewModel.setSelectedOrganizationId(Number(value))}
          >
            <SelectTrigger className="w-full border-red-100 bg-red-50/40 sm:w-72">
              <SelectValue placeholder="Pilih organisasi" />
            </SelectTrigger>
            <SelectContent>
              {viewModel.organizations.map((item) => (
                <SelectItem key={item.organization.id} value={String(item.organization.id)}>
                  {item.organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" className="border-red-100 bg-white hover:bg-red-50 hover:text-red-700" onClick={() => viewModel.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" onClick={() => viewModel.setShowCreateForm((value) => !value)}>
            <Plus className="mr-2 h-4 w-4" />
            Organisasi
          </Button>
        </div>
      </div>

      {viewModel.showCreateForm && (
        <form onSubmit={viewModel.handleCreateOrganization} className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-red-100 bg-red-50/40 p-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="organization-name">Nama Organisasi</Label>
            <Input id="organization-name" placeholder="Contoh: Kampus Nusantara Sehat" value={viewModel.organizationForm.name} onChange={(event) => viewModel.setOrganizationForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organization-email">Email Kontak</Label>
            <Input id="organization-email" type="email" placeholder="wellbeing@kampus.ac.id" value={viewModel.organizationForm.contact_email} onChange={(event) => viewModel.setOrganizationForm((prev) => ({ ...prev, contact_email: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organization-code">Kode</Label>
            <Input id="organization-code" placeholder="kampus-nusantara" value={viewModel.organizationForm.code} onChange={(event) => viewModel.setOrganizationForm((prev) => ({ ...prev, code: event.target.value }))} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="organization-type">Jenis Organisasi</Label>
            <Input id="organization-type" placeholder="education, corporate, komunitas, atau healthcare" value={viewModel.organizationForm.business_type} onChange={(event) => viewModel.setOrganizationForm((prev) => ({ ...prev, business_type: event.target.value }))} />
          </div>
          <div className="flex flex-col gap-2 xs:flex-row xs:justify-end md:col-span-2">
            <Button type="button" variant="outline" onClick={() => viewModel.setShowCreateForm(false)}>Batal</Button>
            <Button type="submit" disabled={viewModel.isSubmitting}>
              {viewModel.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Organisasi
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
