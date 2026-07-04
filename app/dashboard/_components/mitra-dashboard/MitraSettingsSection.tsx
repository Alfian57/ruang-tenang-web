import { CheckCircle2, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageSection } from "./PageSection";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraSettingsSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraSettingsSection({ viewModel }: MitraSettingsSectionProps) {
  return (
    <PageSection className="xl:grid-cols-2">
      <article data-mitra-tour="mitra-onboarding-settings" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CheckCircle2 className="h-5 w-5 text-red-600" />
          Onboarding Anggota
        </h2>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-title">Judul</Label>
            <Input id="onboarding-title" placeholder="Selamat datang di Program Wellbeing" value={viewModel.onboardingDraft.title} onChange={(event) => viewModel.setOnboardingDraft((prev) => ({ ...prev, title: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-message">Pesan sambutan</Label>
            <Textarea id="onboarding-message" placeholder="Halo, kamu sudah terdaftar dalam program wellbeing organisasi. Mulai dari cek mood dan sesi refleksi singkat hari ini." value={viewModel.onboardingDraft.welcome_message} onChange={(event) => viewModel.setOnboardingDraft((prev) => ({ ...prev, welcome_message: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-checklist">Checklist</Label>
            <Textarea id="onboarding-checklist" placeholder={"Lengkapi profil pribadi\nCoba chat refleksi pertama\nSelesaikan breathing session 3 menit"} value={viewModel.onboardingDraft.checklist} onChange={(event) => viewModel.setOnboardingDraft((prev) => ({ ...prev, checklist: event.target.value }))} />
          </div>
          <Button type="button" onClick={viewModel.handleSaveOnboarding} disabled={viewModel.isSubmitting}>Simpan Onboarding</Button>
        </div>
      </article>

      <article data-mitra-tour="mitra-reminder-settings" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <RefreshCw className="h-5 w-5 text-red-600" />
          Pengingat Operasional
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Jalankan pengecekan reminder kontrak, utilisasi kuota, dan tindak lanjut anggota.
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
            <p className="text-sm font-semibold text-red-900">Reminder aktif untuk organisasi terpilih</p>
            <p className="mt-1 text-xs leading-5 text-red-800">
              Sistem akan menyiapkan reminder berdasarkan status langganan, penggunaan kuota, dan persetujuan anggota.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={viewModel.handleRunReminders} disabled={viewModel.isSubmitting}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Jalankan Pengingat
          </Button>
        </div>
      </article>

      <article data-mitra-tour="mitra-sso-settings" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <KeyRound className="h-5 w-5 text-red-600" />
          Single Sign-On (SSO)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Konfigurasikan SSO (SAML/OIDC) agar anggota organisasi dapat login melalui identity provider perusahaan.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sso-provider">Provider</Label>
            <Input
              id="sso-provider"
              placeholder="saml / oidc"
              value={viewModel.ssoDraft.provider}
              onChange={(event) => viewModel.setSsoDraft((prev) => ({ ...prev, provider: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sso-audience">Audience / Entity ID</Label>
            <Input
              id="sso-audience"
              placeholder="ruang-tenang"
              value={viewModel.ssoDraft.audience}
              onChange={(event) => viewModel.setSsoDraft((prev) => ({ ...prev, audience: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sso-issuer">Issuer URL</Label>
            <Input
              id="sso-issuer"
              placeholder="https://idp.example.com/metadata"
              value={viewModel.ssoDraft.issuer_url}
              onChange={(event) => viewModel.setSsoDraft((prev) => ({ ...prev, issuer_url: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sso-entrypoint">Entrypoint URL</Label>
            <Input
              id="sso-entrypoint"
              placeholder="https://idp.example.com/sso"
              value={viewModel.ssoDraft.entrypoint_url}
              onChange={(event) => viewModel.setSsoDraft((prev) => ({ ...prev, entrypoint_url: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="sso-cert">Sertifikat (PEM)</Label>
            <Textarea
              id="sso-cert"
              rows={4}
              placeholder="-----BEGIN CERTIFICATE-----"
              value={viewModel.ssoDraft.certificate_pem}
              onChange={(event) => viewModel.setSsoDraft((prev) => ({ ...prev, certificate_pem: event.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={viewModel.ssoDraft.is_enabled}
              onCheckedChange={(checked) => viewModel.setSsoDraft((prev) => ({ ...prev, is_enabled: checked }))}
            />
            <span className="text-sm text-gray-700">Aktifkan SSO</span>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={viewModel.ssoDraft.enforce_sso}
              onCheckedChange={(checked) => viewModel.setSsoDraft((prev) => ({ ...prev, enforce_sso: checked }))}
            />
            <span className="text-sm text-gray-700">Wajibkan SSO (enforce)</span>
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={viewModel.handleSaveSSO} disabled={viewModel.isSubmitting}>
          Simpan Konfigurasi SSO
        </Button>
      </article>
    </PageSection>
  );
}
