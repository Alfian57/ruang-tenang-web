"use client";

import { useEffect } from "react";

/**
 * Memastikan service worker lama segera digantikan oleh versi terbaru.
 *
 * Bug pada service worker versi lama (cross-origin POST ikut masuk strategi
 * cache) hanya bisa hilang setelah SW baru mengambil kendali. Browser tidak
 * selalu melakukannya otomatis hanya dengan reload, jadi komponen ini:
 *  1. memicu pengecekan update SW saat halaman dimuat, dan
 *  2. reload sekali ketika SW baru selesai mengambil kendali
 *     (`controllerchange`), sehingga halaman langsung dijalankan SW baru.
 *
 * Reload hanya dilakukan bila sebelumnya sudah ada SW yang mengendalikan
 * halaman, agar kunjungan pertama tidak memicu reload berulang.
 */
export function ServiceWorkerUpdater() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;

    const handleControllerChange = () => {
      if (!hadController || reloaded) return;

      // Cegah reload berulang: hanya reload sekali per sesi tab.
      try {
        if (sessionStorage.getItem("rt-sw-reloaded") === "1") return;
        sessionStorage.setItem("rt-sw-reloaded", "1");
      } catch {
        /* sessionStorage bisa tidak tersedia (mode privat) */
      }

      reloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.update())
      .catch(() => {
        /* update SW bersifat best-effort */
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
