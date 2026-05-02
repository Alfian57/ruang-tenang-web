import { Building2, CheckCircle2, Copy, Mail, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatReadableStatus,
  getStatusDotClass,
  getStatusTone,
} from "../mitra-dashboard-utils";
import { PageSection } from "./PageSection";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraOrganizationsSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraOrganizationsSection({ viewModel }: MitraOrganizationsSectionProps) {
  const selectedOrg = viewModel.selectedOrganization?.organization;
  const statusCards = [
    { key: "active", label: "Aktif", helper: "Seat sedang dipakai" },
    { key: "invited", label: "Diundang", helper: "Menunggu aktivasi" },
    { key: "pending_approval", label: "Perlu Approval", helper: "Butuh keputusan" },
    { key: "removed", label: "Dihapus", helper: "Akses dilepas" },
  ];

  return (
    <PageSection className="items-start xl:grid-cols-12">
      <aside className="min-w-0 space-y-4 xl:col-span-4">
        <article data-mitra-tour="mitra-organizations-list" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Building2 className="h-5 w-5 text-red-600" />
              Daftar Organisasi
            </h2>
            <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              {viewModel.organizations.length} workspace
            </span>
          </div>
          <div className="mt-4 max-h-[24rem] space-y-2 overflow-auto pr-1">
            {viewModel.organizations.map((item) => {
              const isSelected = item.organization.id === viewModel.selectedOrganizationId;

              return (
                <button
                  key={item.organization.id}
                  type="button"
                  onClick={() => viewModel.setSelectedOrganizationId(item.organization.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${isSelected ? "border-red-200 bg-red-50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-gray-950">{item.organization.name}</p>
                      <p className="mt-1 break-all text-xs text-gray-500">{item.organization.contact_email}</p>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">{formatReadableStatus(item.organization.status)}</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">{formatReadableStatus(item.member_role)}</span>
                    <span className={`rounded-full px-2 py-0.5 font-medium ${getStatusTone(item.member_status)}`}>{formatReadableStatus(item.member_status)}</span>
                  </div>
                </button>
              );
            })}
            {viewModel.organizations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                Belum ada organisasi. Buat organisasi pertama dari tombol di header.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CheckCircle2 className="h-5 w-5 text-red-600" />
            Ringkasan Organisasi
          </h2>
          {selectedOrg ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                <p className="break-words font-semibold text-gray-950">{selectedOrg.name}</p>
                <p className="mt-1 break-all text-sm text-gray-600">{selectedOrg.contact_email}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-red-700 ring-1 ring-red-100">{selectedOrg.code}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-gray-700 ring-1 ring-red-100">{selectedOrg.business_type || "Tipe belum diisi"}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-gray-700">Pemakaian seat</span>
                  <span className="font-semibold text-gray-950">{viewModel.seatUsage?.used_seats ?? 0}/{viewModel.seatUsage?.contracted_seats ?? 0}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, Math.max(0, viewModel.seatUsagePercent))}%` }} />
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {viewModel.seatUsage?.available_seats ?? 0} seat tersedia. Approval anggota {selectedOrg.requires_member_approval ? "aktif" : "otomatis"}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Langganan</p>
                  <p className="mt-1 break-words font-semibold text-gray-950">{viewModel.subscription?.plan_name ?? "Belum aktif"}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Approval</p>
                  <p className="mt-1 font-semibold text-gray-950">{viewModel.pendingMembers.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4 text-sm leading-6 text-gray-600">
              Pilih organisasi untuk melihat ringkasan seat, status langganan, dan approval anggota.
            </div>
          )}
        </article>
      </aside>

      <div className="min-w-0 space-y-4 xl:col-span-8">
        <article data-mitra-tour="mitra-member-invite" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Users className="h-5 w-5 text-red-600" />
                Anggota dan Approval
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Buat undangan satuan untuk anggota baru dan tentukan role aksesnya.</p>
            </div>
            {viewModel.summary && (
              <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {viewModel.members.length} anggota
              </span>
            )}
          </div>

          {viewModel.isLoadingDetail ? (
            <div className="mt-4 h-44 animate-pulse rounded-2xl bg-gray-100" />
          ) : !viewModel.summary ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
              Pilih organisasi untuk melihat anggota.
            </div>
          ) : (
            <form onSubmit={viewModel.handleInviteMember} className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-4 lg:grid-cols-12">
              <div className="space-y-1.5 lg:col-span-5">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" placeholder="anggota@kampus.ac.id" value={viewModel.inviteForm.email} onChange={(event) => viewModel.setInviteForm((prev) => ({ ...prev, email: event.target.value }))} />
              </div>
              <div className="space-y-1.5 lg:col-span-3">
                <Label htmlFor="invite-name">Nama</Label>
                <Input id="invite-name" placeholder="Nama lengkap anggota" value={viewModel.inviteForm.full_name} onChange={(event) => viewModel.setInviteForm((prev) => ({ ...prev, full_name: event.target.value }))} />
              </div>
              <div className="space-y-1.5 lg:col-span-2">
                <Label>Role</Label>
                <Select value={viewModel.inviteForm.role} onValueChange={(value) => viewModel.setInviteForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end lg:col-span-2">
                <Button type="submit" className="w-full" disabled={viewModel.isSubmitting}>
                  <Mail className="mr-2 h-4 w-4" />
                  Undang
                </Button>
              </div>
            </form>
          )}

          {viewModel.summary && viewModel.lastInvite && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800 md:flex-row md:items-center md:justify-between">
              <span className="break-all">{viewModel.lastInvite.link}</span>
              <Button type="button" size="sm" variant="outline" onClick={viewModel.handleCopyInviteLink}>
                <Copy className="mr-2 h-4 w-4" />
                Salin
              </Button>
            </div>
          )}
        </article>

        {!viewModel.isLoadingDetail && viewModel.summary && (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article data-mitra-tour="mitra-bulk-invite" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-950">Bulk Invite</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">Tempel beberapa email sekaligus, satu anggota per baris.</p>
                  </div>
                  <Mail className="h-5 w-5 shrink-0 text-red-600" />
                </div>
                <Label htmlFor="bulk-invite" className="mt-4 block">Daftar anggota</Label>
                <Textarea id="bulk-invite" className="mt-2 min-h-32" value={viewModel.bulkInviteText} onChange={(event) => viewModel.setBulkInviteText(event.target.value)} placeholder={"anggota1@kampus.ac.id, Andi Pratama\nanggota2@kampus.ac.id, Sinta Ayu"} />
                <Button type="button" variant="outline" className="mt-3 w-full xs:w-auto" onClick={viewModel.handleBulkInvite} disabled={viewModel.isSubmitting}>
                  Proses Bulk Invite
                </Button>
                {viewModel.bulkInviteResult && (
                  <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    {viewModel.bulkInviteResult.invited} invited, {viewModel.bulkInviteResult.skipped} skipped dari {viewModel.bulkInviteResult.total} baris.
                  </p>
                )}
              </article>

              <article data-mitra-tour="mitra-member-status" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-950">Status Anggota</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">Pantau distribusi anggota untuk organisasi terpilih.</p>
                  </div>
                  <Users className="h-5 w-5 shrink-0 text-red-600" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm xs:grid-cols-2">
                  {statusCards.map((status) => (
                    <div key={status.key} className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{status.label}</p>
                        <span className={`h-2.5 w-2.5 rounded-full ${getStatusDotClass(status.key)}`} />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-gray-950">{viewModel.memberStatusCounts[status.key] ?? 0}</p>
                      <p className="mt-1 text-xs text-gray-500">{status.helper}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article data-mitra-tour="mitra-member-list" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-950">Daftar Anggota</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">Kelola approval dan akses anggota organisasi.</p>
                </div>
                {viewModel.pendingMembers.length > 0 && (
                  <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {viewModel.pendingMembers.length} perlu approval
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {viewModel.members.map((member) => (
                  <div key={member.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-gray-900">{member.full_name || member.email}</p>
                      <p className="break-all text-xs text-gray-500">{member.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{formatReadableStatus(member.role)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusTone(member.status)}`}>{formatReadableStatus(member.status)}</span>
                      {member.status === "pending_approval" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => viewModel.handleApproveMember(member.id)}>
                            <UserCheck className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => viewModel.handleRejectMember(member.id)}>
                            <UserX className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {member.role !== "owner" && member.status !== "removed" && (
                        <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" aria-label={`Hapus akses ${member.full_name || member.email}`} onClick={() => viewModel.handleRemoveMember(member.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {viewModel.members.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm leading-6 text-gray-600">
                    Belum ada anggota. Buat link undangan atau gunakan bulk invite untuk mulai mengisi seat organisasi.
                  </div>
                )}
              </div>
            </article>
          </>
        )}
      </div>
    </PageSection>
  );
}
