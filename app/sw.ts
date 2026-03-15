/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

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

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
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
