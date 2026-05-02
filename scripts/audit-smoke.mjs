import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFile(path) {
  assert(existsSync(join(root, path)), `Missing expected file: ${path}`);
}

function assertContains(path, needle, message = `${path} must contain ${needle}`) {
  assert(read(path).includes(needle), message);
}

function assertNotContains(path, needle, message = `${path} must not contain ${needle}`) {
  assert(!read(path).includes(needle), message);
}

function assertAllowedAttrsAreLockedDown() {
  const source = read("utils/sanitize.ts");
  const match = source.match(/const ALLOWED_ATTR = \[([\s\S]*?)\];/);
  assert(match, "utils/sanitize.ts must define ALLOWED_ATTR as an array");

  const allowedAttrs = match[1];
  for (const forbidden of ['"style"', '"class"', '"id"']) {
    assert(!allowedAttrs.includes(forbidden), `Sanitizer must not allow ${forbidden}`);
  }
}

[
  "app/(landing)/contact/page.tsx",
  "app/dashboard/admin/layout.tsx",
  "app/dashboard/billing/page.tsx",
  "app/dashboard/consultation/page.tsx",
  "app/dashboard/mitra/layout.tsx",
  "app/dashboard/mood-tracker/page.tsx",
  "app/dashboard/moderation/layout.tsx",
  "app/dashboard/settings/page.tsx",
  "app/dashboard/topup/page.tsx",
  "hooks/useBillingCheckout.ts",
].forEach(assertFile);

assertContains("app/dashboard/admin/layout.tsx", "requireAdmin", "Admin dashboard must enforce admin role");
assertContains("app/dashboard/moderation/layout.tsx", "requireAdmin", "Moderation dashboard must enforce admin role");
assertContains("app/dashboard/mitra/layout.tsx", "requireMitra", "Mitra dashboard must enforce mitra role");

assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.BILLING", "Member navigation must expose Premium & Billing");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.TOPUP", "Member navigation must expose top up");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.ORGANIZATIONS", "Mitra navigation must expose organization management");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.SUBSCRIPTION", "Mitra navigation must expose subscription management");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.INSIGHTS", "Mitra navigation must expose analytics insights");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.SETTINGS", "Mitra navigation must expose B2B settings");

assertContains("lib/routes.ts", "/dashboard/moderation/queue?focus=", "Moderation article links must target the existing queue route");
assertContains("lib/routes.ts", "/dashboard/moderation/reports?focus=", "Moderation report links must target the existing reports route");
assertNotContains("lib/routes.ts", "/dashboard/moderation/articles/", "Moderation article links must not target missing detail pages");

assertContains("app/dashboard/_components/member-dashboard/DailyQuestSection.tsx", "Status Paket", "Member dashboard must make premium/free status visible");
assertContains("app/dashboard/_components/member-dashboard/DailyQuestSection.tsx", "Quest Hari Ini", "Member dashboard must guide the core daily journey");
assertContains("app/dashboard/_components/member-dashboard/DailyQuestSection.tsx", "Mulai dari sini", "Member dashboard must include a first-run starting point");
assertContains("app/dashboard/_components/member-dashboard/DailyQuestSection.tsx", "Akun Gratis", "Member dashboard must explain free account state");
assertContains("app/dashboard/_components/member-dashboard/DailyQuestSection.tsx", "Premium aktif", "Member dashboard must explain premium account state");
assertContains("app/dashboard/chat/_hooks/useChatPage.ts", "chat-quota-limited", "Chat page must react to exhausted quota events");
assertContains("app/dashboard/chat/_components/ChatMessagesArea.tsx", "isQuotaExhausted", "Chat input must lock when quota is exhausted");
assertContains("app/dashboard/chat/_components/ChatMessagesArea.tsx", "Tulis Jurnal", "Chat quota exhausted state must offer a non-chat alternative");
assertContains("app/dashboard/chat/_components/ChatMessagesArea.tsx", "Atur Napas", "Chat quota exhausted state must offer breathing support");
assertContains("app/dashboard/chat/_components/EmptyState.tsx", "Mulai guided check-in", "Chat empty state must prioritize guided check-in");
assertContains("components/shared/gamification/DailyTaskFAB.tsx", "showPremiumTeasers", "Daily task FAB must show premium locked tasks for free users");

assertContains("app/(landing)/_components/LandingDataNotice.tsx", "Simulasi pengalaman publik", "Landing demo data must be clearly labeled");
assertContains("app/(landing)/_components/HeroSection.tsx", "/images/landing/about-doctor.png", "Landing hero must use the Figma hero visual asset");
assertNotContains("app/(landing)/_components/HeroSection.tsx", "/images/avatar/hero-mascot.jpg", "Landing hero must not use the watermarked mascot sheet");
assertNotContains("app/(landing)/_components/HeroSection.tsx", "/images/dummy-article-5.png", "Landing hero must not use dummy article imagery");
assertNotContains("app/(landing)/_components/ArticleSection.tsx", "dummy-article", "Landing articles must not fall back to dummy article imagery");
assertNotContains("app/(landing)/_components/ArticleSection.tsx", "/images/avatar/community-illustration.jpg", "Landing article fallback must not use watermarked avatar imagery");
assertContains("app/(auth)/register/page.tsx", "TRUST_CUES.COMBINED", "Register page must show the same privacy and AI trust cue as login");

assertContains("middleware.ts", "frame-src", "CSP must allow explicit frame sources for payment popups");
assertContains("middleware.ts", "https://app.sandbox.midtrans.com", "CSP must include sandbox Midtrans app origin");
assertContains("middleware.ts", "https://app.midtrans.com", "CSP must include production Midtrans app origin");
assertContains("middleware.ts", "https://api.sandbox.midtrans.com", "CSP must include sandbox Midtrans API origin");
assertContains("middleware.ts", "https://api.midtrans.com", "CSP must include production Midtrans API origin");

assertAllowedAttrsAreLockedDown();
assertContains("utils/sanitize.ts", "noopener noreferrer", "External sanitized links must be hardened");
assertContains("utils/sanitize.ts", "ALLOWED_URI_REGEXP", "Sanitizer must restrict URI schemes");

assertContains("next.config.ts", "NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS", "Image hosts must be configurable by allowlist");
assertNotContains("next.config.ts", 'hostname: "**"', "Next image config must not allow every remote host");
assertNotContains("next.config.ts", "hostname: '*'", "Next image config must not allow every remote host");

assertContains("app/dashboard/billing/page.tsx", "useBillingCheckout", "Billing page must use the shared checkout hook");
assertContains("app/dashboard/topup/page.tsx", "useBillingCheckout", "Topup page must use the shared checkout hook");
assertContains("app/dashboard/billing/page.tsx", "Premium B2B", "Billing page must compare B2B premium access");
assertContains("app/dashboard/topup/page.tsx", "Fokus halaman ini adalah saldo koin", "Topup page must keep coin purchase separate from premium decisions");
assertContains("app/dashboard/_components/mitra-dashboard/MitraOverviewSection.tsx", "Pusat Kendali Mitra", "Mitra dashboard must expose an organization command bar");
assertContains("components/layout/dashboard/nav-config.ts", "Pernapasan", "Dashboard navigation should use consistent Indonesian copy");
assertContains("app/dashboard/_components/mitra-dashboard/MitraInsightsSection.tsx", "Belum ada trend analitik", "Mitra dashboard must show localized analytics empty state");

assertContains("components/layout/dashboard/useGlobalSearch.ts", "Musik", "Global search must expose music as an active result section");
assertNotContains("components/layout/dashboard/GlobalSearch.tsx", "Segera Hadir", "Global search must not label active music results as coming soon");
assertContains("components/ui/button.tsx", "Memuat...", "Shared button loading copy must be localized");
assertContains("components/ui/spinner.tsx", "Memuat...", "Shared spinner loading copy must be localized");
assertContains("components/shared/stories/StoryComments.tsx", "Mengirim", "Story comment submission must show a clear loading state");
assertContains("app/dashboard/community/page.tsx", "Papan Misi Kreatif", "Community dashboard must use localized mission copy");
assertContains("app/dashboard/topup/page.tsx", "Muat Ulang", "Topup empty state must provide a recovery action");
assertContains("components/pwa/PWAInstallPrompt.tsx", "Pasang Ruang Tenang", "PWA install prompt must use localized copy");
assertContains("components/notification/PushNotificationToggle.tsx", "Push Notification Aktif", "Push notification toggle must use clear localized product copy");

assertFile("app/dashboard/breathing/_components/BreathingVisual.tsx");
assertContains("app/dashboard/breathing/_components/BreathingVisual.tsx", "animation_type", "Breathing session must honor technique animation type");
assertContains("app/dashboard/breathing/_components/SessionPlayer.tsx", "Perjalanan Napas", "Breathing player must present a guided journey, not only a countdown");
assertContains("app/dashboard/breathing/_components/SessionPlayer.tsx", "speechSynthesis", "Breathing voice guidance toggle must drive browser speech guidance");
assertContains("app/dashboard/breathing/_hooks/useBreathing.ts", "pendingCompletion", "Breathing completion must collect reflection before saving");
assertContains("app/dashboard/breathing/_components/CompletionModal.tsx", "Refleksi Setelah Sesi", "Breathing completion must ask for post-session reflection");
assertContains("app/dashboard/breathing/_components/TechniquesView.tsx", "Mulai Cepat", "Breathing technique selection must expose intent-based quick starts");

assertContains("lib/offline/syncOutbox.ts", "useAuthStore.getState()", "Offline sync must use the current auth token");
assertContains("services/http/client.ts", "OFFLINE_QUEUEABLE_PREFIXES", "Offline queueing must use an explicit allowlist");
assertContains("services/http/client.ts", "OFFLINE_NEVER_QUEUE_PREFIXES", "Offline queueing must exclude sensitive mutation domains");
assertContains("services/http/client.ts", "isOfflineQueueableMutation", "Offline queueing must be gated before enqueueing mutations");

console.log("Audit smoke checks passed.");
