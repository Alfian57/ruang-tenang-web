/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
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
