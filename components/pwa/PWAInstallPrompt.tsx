"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed the prompt recently
        const dismissed = localStorage.getItem("pwa-install-dismissed");
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            // Show again after 7 days
            if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
                return;
            }
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    };

    if (isInstalled || !showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5 text-red-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">
                            Install Ruang Tenang
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Akses lebih cepat langsung dari layar utama perangkatmu
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleInstall}
                                className="px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Nanti Saja
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
