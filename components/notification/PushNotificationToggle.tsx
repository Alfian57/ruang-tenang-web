"use client";

import { BellRing, BellOff, Loader2 } from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";
import { toast } from "sonner";

export function PushNotificationToggle() {
    const { permission, isSubscribed, loading, isPushSupported, subscribe, unsubscribe } = usePushNotification();

    if (!isPushSupported) return null;

    const handleToggle = async () => {
        if (isSubscribed) {
            const ok = await unsubscribe();
            if (ok) toast.success("Notifikasi push dinonaktifkan");
        } else {
            const ok = await subscribe();
            if (ok) {
                toast.success("Notifikasi push diaktifkan!");
            } else if (permission === "denied") {
                toast.error("Izin notifikasi ditolak. Ubah di pengaturan browser.");
            }
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading || permission === "denied"}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
                permission === "denied"
                    ? "Izin notifikasi ditolak di browser"
                    : isSubscribed
                        ? "Nonaktifkan notifikasi push"
                        : "Aktifkan notifikasi push"
            }
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : isSubscribed ? (
                <BellRing className="w-4 h-4 text-red-500" />
            ) : (
                <BellOff className="w-4 h-4 text-gray-400" />
            )}
            <span className={isSubscribed ? "text-gray-800" : "text-gray-500"}>
                {loading
                    ? "Memproses..."
                    : permission === "denied"
                        ? "Notifikasi Diblokir"
                        : isSubscribed
                            ? "Push Notification Aktif"
                            : "Aktifkan Push Notification"}
            </span>
        </button>
    );
}
