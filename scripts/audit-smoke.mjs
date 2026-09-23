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

function assertNoFile(path) {
  assert(!existsSync(join(root, path)), `Unexpected legacy route file: ${path}`);
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
  "app/dashboard/community/page.tsx",
  "app/dashboard/consultation/page.tsx",
  "app/dashboard/journey/page.tsx",
  "app/dashboard/mitra/layout.tsx",
  "app/dashboard/mood-tracker/page.tsx",
  "app/dashboard/moderation/layout.tsx",
  "app/dashboard/settings/page.tsx",
  "hooks/useBillingCheckout.ts",
].forEach(assertFile);

[
  "app/dashboard/forum/page.tsx",
  "app/dashboard/forum/[slug]/page.tsx",
  "app/dashboard/stories/page.tsx",
  "app/dashboard/stories/[id]/page.tsx",
  "app/dashboard/stories/new/page.tsx",
  "app/dashboard/progress-map/page.tsx",
  "app/dashboard/rewards/page.tsx",
  "app/dashboard/reading/page.tsx",
  "app/dashboard/reading/[slug]/page.tsx",
  "app/dashboard/topup/page.tsx",
].forEach(assertNoFile);

assertContains("app/dashboard/admin/layout.tsx", "requireAdmin", "Admin dashboard must enforce admin role");
assertContains("app/dashboard/moderation/layout.tsx", "requireAdmin", "Moderation dashboard must enforce admin role");
assertContains("app/dashboard/mitra/layout.tsx", "requireMitra", "Mitra dashboard must enforce mitra role");
assertContains("app/dashboard/layout.tsx", "pathname === ROUTES.DASHBOARD", "Shared dashboard access must not make every member route role-agnostic");

assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.COMMUNITY", "Member navigation must expose the Community hub");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.JOURNEY", "Member navigation must expose the Journey hub");
assertNotContains("components/layout/dashboard/nav-config.ts", "ROUTES.BILLING", "Billing must live in the account menu, not primary navigation");
assertNotContains("components/layout/dashboard/nav-config.ts", "ROUTES.TOPUP", "Top up must not have a primary navigation entry");
assertContains("components/layout/dashboard/TopHeader.tsx", "Paket &amp; Koin", "Desktop account menu must expose Paket & Koin");
assertContains("components/layout/dashboard/MobileHeader.tsx", "Paket &amp; Koin", "Mobile account menu must expose Paket & Koin");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.ORGANIZATIONS", "Mitra navigation must expose organization management");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.SUBSCRIPTION", "Mitra navigation must expose subscription management");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.INSIGHTS", "Mitra navigation must expose analytics insights");
assertContains("components/layout/dashboard/nav-config.ts", "ROUTES.MITRA.SETTINGS", "Mitra navigation must expose B2B settings");

assertContains("lib/routes.ts", "/dashboard/moderation/queue?focus=", "Moderation article links must target the existing queue route");
assertContains("lib/routes.ts", "/dashboard/moderation/reports?focus=", "Moderation report links must target the existing reports route");
assertNotContains("lib/routes.ts", "/dashboard/moderation/articles/", "Moderation article links must not target missing detail pages");
assertContains("lib/routes.ts", "/dashboard/community/forum/", "Forum details must use the nested Community route");
assertContains("lib/routes.ts", "/dashboard/community/stories/", "Story details must use the nested Community route");
assertContains("lib/routes.ts", "/dashboard/journey?tab=", "Journey tabs must be URL-addressable");
assertContains("lib/routes.ts", "/dashboard/billing?tab=", "Paket & Koin tabs must be URL-addressable");
assertNotContains("lib/routes.ts", '"/dashboard/topup"', "Legacy top up route must be removed");

assertNotContains("app/dashboard/journey/page.tsx", 'value: "missions"', "Journey hub must not duplicate daily missions from the FAB");
assertContains("components/shared/gamification/DailyTaskFAB.tsx", "Misi Harian", "Daily task FAB must remain the canonical mission surface");
assertContains("app/dashboard/journey/_components/SummaryPanel.tsx", "XPVisualizationsSection", "Journey summary must expose XP progress");
assertContains("app/dashboard/journey/_components/SummaryPanel.tsx", "BadgeShowcase", "Journey summary must expose badges");
assertContains("app/dashboard/chat/_hooks/useChatPage.ts", "chat-quota-limited", "Chat page must react to exhausted quota events");
assertContains("app/dashboard/chat/_components/ChatMessagesArea.tsx", "isQuotaExhausted", "Chat input must lock when quota is exhausted");
assertContains("app/dashboard/chat/_components/ChatMessagesArea.tsx", "Tulis Jurnal", "Chat quota exhausted state must offer a non-chat alternative");
assertContains("app/dashboard/chat/_components/EmptyState.tsx", "Mulai check-in terpandu", "Chat empty state must prioritize guided check-in");
assertContains("components/shared/gamification/DailyTaskFAB.tsx", "showPremiumTeasers", "Daily task FAB must show premium locked tasks for free users");

assertContains("app/(landing)/_components/LandingDataNotice.tsx", "Simulasi pengalaman publik", "Landing demo data must be clearly labeled");
assertContains("app/(landing)/_components/LandingStatic.tsx", "/welcome.webp", "Landing hero must use the canonical mascot family");
for (const pose of ["welcome", "mood", "journal", "companion", "breathe", "celebrate", "community", "heart"]) {
  assertFile(`public/images/landing/mascot/${pose}.webp`);
}
for (const pose of ["read", "listen", "map", "trophy", "message", "secure", "key"]) {
  assertFile(`assets/mascot/mascot-${pose}.png`);
  assertFile(`public/images/landing/mascot/${pose}.webp`);
}
for (const pose of ["welcome", "heart", "secure", "key"]) {
  assertFile(`assets/mascot/mascot-auth-${pose}.png`);
  assertFile(`assets/mascot/mascot-auth-${pose}-cutout.png`);
  assertFile(`public/images/landing/mascot/auth-${pose}-cutout.webp`);
}
assertNotContains("app/(landing)/_components/LandingStatic.tsx", "Teman kecil untuk hari yang besar", "Landing hero badge must stay removed");
assertContains("app/(landing)/articles/page.tsx", "PublicPageHero", "Article directory must use public mascot hero");
assertContains("app/(landing)/stories/page.tsx", "PublicPageHero", "Stories directory must use public mascot hero");
assertContains("components/shared/auth/AuthIllustration.tsx", "mascot/${pose}.webp", "Auth illustration must use mascot pose assets");
assertContains("components/shared/auth/AuthIllustration.tsx", "auth-${pose}-cutout.webp", "Desktop auth art must use clean mascot cutouts");
assertContains("app/(landing)/_components/LandingStatic.tsx", 'id="gamification"', "Old gamification anchor must remain usable");
assertContains("app/(landing)/_components/LandingCommunity.tsx", 'id="stories"', "Old stories anchor must remain usable");
assertContains("app/(landing)/_components/LandingCommunity.tsx", 'id="leaderboard"', "Old leaderboard anchor must remain usable");
assertNotContains("app/(landing)/_components/LandingStatic.tsx", "about-doctor.webp", "Landing hero must not use the old generic image");
assertNotContains("app/(landing)/_components/LandingStatic.tsx", "/images/avatar/hero-mascot.jpg", "Landing hero must not use the watermarked mascot sheet");
assertNotContains("app/(landing)/_components/LandingStatic.tsx", "/images/dummy-article-5.png", "Landing hero must not use dummy article imagery");
assertNotContains("app/(landing)/_components/LandingArticles.tsx", "dummy-article", "Landing articles must not fall back to dummy article imagery");
assertNotContains("app/(landing)/_components/LandingArticles.tsx", "/images/avatar/community-illustration.jpg", "Landing article fallback must not use watermarked avatar imagery");
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

assertContains("app/dashboard/billing/_components/BillingPanel.tsx", "useBillingCheckout", "Package and transaction panels must use the shared checkout hook");
assertContains("app/dashboard/billing/_components/CoinsPanel.tsx", "useBillingCheckout", "Coin checkout must use the shared checkout hook");
assertContains("app/dashboard/billing/_components/BillingPanel.tsx", "Premium B2B", "Package panel must compare B2B premium access");
assertContains("app/dashboard/_components/mitra-dashboard/MitraOverviewSection.tsx", "Pusat Kendali Mitra", "Mitra dashboard must expose an organization command bar");
assertContains("app/dashboard/_components/mitra-dashboard/MitraInsightsSection.tsx", "Belum ada tren analitik", "Mitra dashboard must show localized analytics empty state");

assertContains("components/layout/dashboard/useGlobalSearch.ts", "Musik", "Global search must expose music as an active result section");
assertNotContains("components/layout/dashboard/GlobalSearch.tsx", "Segera Hadir", "Global search must not label active music results as coming soon");
assertContains("components/ui/button.tsx", "Memuat...", "Shared button loading copy must be localized");
assertContains("components/ui/spinner.tsx", "Memuat...", "Shared spinner loading copy must be localized");
assertContains("components/shared/stories/StoryComments.tsx", "Mengirim", "Story comment submission must show a clear loading state");
assertContains("app/dashboard/community/page.tsx", "Jurnal Publik", "Community hub must expose public journals");
assertContains("app/dashboard/billing/_components/CoinsPanel.tsx", "Muat Ulang", "Coin catalog empty state must provide a recovery action");
assertContains("store/dailyTaskStore.ts", "inflightLoad", "Daily task requests must be deduplicated across the FAB and Journey tab");
assertContains("components/pwa/PWAInstallPrompt.tsx", "Pasang Ruang Tenang", "PWA install prompt must use localized copy");
assertContains("components/notification/PushNotificationToggle.tsx", "Push Notification Aktif", "Push notification toggle must use clear localized product copy");

assertNotContains("lib/routes.ts", "/dashboard/breathing", "Breathing route must be removed from the web app");
assertNotContains("components/layout/dashboard/nav-config.ts", "breathing", "Breathing navigation must be removed from the web app");

assertContains("lib/offline/syncOutbox.ts", "useAuthStore.getState()", "Offline sync must use the current auth token");
assertContains("services/http/client.ts", "OFFLINE_QUEUEABLE_PREFIXES", "Offline queueing must use an explicit allowlist");
assertContains("services/http/client.ts", "OFFLINE_NEVER_QUEUE_PREFIXES", "Offline queueing must exclude sensitive mutation domains");
assertContains("services/http/client.ts", "isOfflineQueueableMutation", "Offline queueing must be gated before enqueueing mutations");

console.log("Audit smoke checks passed.");
