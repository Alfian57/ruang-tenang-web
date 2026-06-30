/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst, ExpirationPlugin, RangeRequestsPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Custom runtime caching for API routes
const apiCacheStrategies = [
  // Articles — StaleWhileRevalidate (fast offline reads, update in background)
  {
    matcher: ({ url }: { url: URL }) => url.pathname.includes("/api/v1/articles"),
    handler: new StaleWhileRevalidate({
      cacheName: "api-articles",
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  },
  // Journals — NetworkFirst (prefer fresh data, fallback to cache)
  {
    matcher: ({ url }: { url: URL }) => url.pathname.includes("/api/v1/journals"),
    handler: new NetworkFirst({
      cacheName: "api-journals",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      ],
    }),
  },
  // Moods — NetworkFirst
  {
    matcher: ({ url }: { url: URL }) => url.pathname.includes("/api/v1/user-moods"),
    handler: new NetworkFirst({
      cacheName: "api-moods",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  },
  // Gamification — NetworkFirst
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname.includes("/api/v1/gamification") ||
      url.pathname.includes("/api/v1/community-progress") ||
      url.pathname.includes("/api/v1/badges") ||
      url.pathname.includes("/api/v1/level-configs"),
    handler: new NetworkFirst({
      cacheName: "api-gamification",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  },
  // Chat sessions — NetworkFirst
  {
    matcher: ({ url }: { url: URL }) => url.pathname.includes("/api/v1/chat"),
    handler: new NetworkFirst({
      cacheName: "api-chat",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      ],
    }),
  },
  // Songs / music metadata — StaleWhileRevalidate
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname.includes("/api/v1/songs") ||
      url.pathname.includes("/api/v1/song-categories"),
    handler: new StaleWhileRevalidate({
      cacheName: "api-music",
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  },
  // Forum — StaleWhileRevalidate
  {
    matcher: ({ url }: { url: URL }) => url.pathname.includes("/api/v1/forums"),
    handler: new StaleWhileRevalidate({
      cacheName: "api-forums",
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  },
];

// Dedicated audio caching for relaxation music & voice notes.
//
// Why a custom rule instead of relying on Serwist's defaultCache audio entry:
//  1. defaultCache only matches mp3/wav/ogg by file extension AND only handles
//     cross-origin requests when the regex matches the *entire* URL — uploaded
//     audio is served with query strings / from the API origin, so it slips
//     through. Matching on the `/uploads/audio` & `/storage/audio` path (plus a
//     broader extension list) reliably catches every track.
//  2. A larger, longer-lived cache (relaxation tracks are immutable, UUID-named)
//     gives a dependable offline music experience.
//  3. RangeRequestsPlugin is required so the <audio> element can seek within a
//     cached file (browsers issue Range requests for media).
const audioCacheStrategy = {
  matcher: ({ url, request }: { url: URL; request: Request }) =>
    request.destination === "audio" ||
    /\/(?:uploads|storage)\/audio\//i.test(url.pathname) ||
    /\.(?:mp3|wav|ogg|m4a|aac|opus)$/i.test(url.pathname),
  handler: new CacheFirst({
    cacheName: "audio-assets",
    plugins: [
      // Cache only successful full (200) and partial (206) audio responses.
      // Note: opaque responses (status 0) are skipped to avoid storing errors.
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days — tracks are immutable
        purgeOnQuotaError: true, // free audio cache first under storage pressure
      }),
      new RangeRequestsPlugin(),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    audioCacheStrategy,
    ...apiCacheStrategies,
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Push notification event handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag, data: notifData } = data;

    event.waitUntil(
      self.registration.showNotification(title || "Ruang Tenang", {
        body: body || "Kamu punya notifikasi baru",
        icon: icon || "/favicon/android-chrome-192x192.png",
        badge: badge || "/favicon/favicon-32x32.png",
        tag: tag || "ruang-tenang-notification",
        data: notifData || {},
        actions: [
          { action: "open", title: "Buka" },
          { action: "dismiss", title: "Tutup" },
        ],
      } as NotificationOptions)
    );
  } catch {
    // Fallback for text payload
    event.waitUntil(
      self.registration.showNotification("Ruang Tenang", {
        body: event.data.text(),
        icon: "/favicon/android-chrome-192x192.png",
      })
    );
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlPath = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            (client as WindowClient).navigate(urlPath);
          }
          return;
        }
      }
      // Open new window
      return self.clients.openWindow(urlPath);
    })
  );
});

serwist.addEventListeners();
