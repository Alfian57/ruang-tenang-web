"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pushService } from "@/services/api/push";
import { useAuthStore } from "@/store/authStore";

type PushPermission = "default" | "granted" | "denied" | "unsupported";

function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export function usePushNotification() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((s) => s.token);
  const vapidKeyRef = useRef<string | null>(null);

  // Check current permission and subscription state
  useEffect(() => {
    if (!isPushSupported()) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermission);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const fetchVAPIDKey = useCallback(async (): Promise<string | null> => {
    if (vapidKeyRef.current) return vapidKeyRef.current;
    try {
      const res = await pushService.getVAPIDKey();
      vapidKeyRef.current = res.data.public_key;
      return res.data.public_key;
    } catch {
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isPushSupported() || !token) return false;
    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);

      if (result !== "granted") {
        setLoading(false);
        return false;
      }

      const vapidKey = await fetchVAPIDKey();
      if (!vapidKey) {
        setLoading(false);
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const subJSON = subscription.toJSON();
      await pushService.subscribe(token, {
        endpoint: subscription.endpoint,
        p256dh: subJSON.keys?.p256dh || "",
        auth: subJSON.keys?.auth || "",
      });

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, [token, fetchVAPIDKey]);

  const unsubscribe = useCallback(async () => {
    if (!isPushSupported() || !token) return false;
    setLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await pushService.unsubscribe(token, subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, [token]);

  return {
    permission,
    isSubscribed,
    loading,
    isPushSupported: isPushSupported(),
    subscribe,
    unsubscribe,
  };
}
