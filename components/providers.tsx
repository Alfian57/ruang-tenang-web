"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Unified Providers component
 * 
 * Wraps the application with all necessary context providers.
 * This centralizes provider management and makes it easy to add
 * new providers in the future.
 * 
 * Currently includes:
 * - Toaster: For toast notifications
 * 
 * Future providers can be added here:
 * - Theme provider
 * - Auth provider
 * - Query client provider
 * - etc.
 */
export function Providers({ children }: ProvidersProps) {
    const pathname = usePathname();

    React.useEffect(() => {
        if (!pathname) return;

        const currentPath = sessionStorage.getItem("rt_current_path");
        if (currentPath && currentPath !== pathname) {
            sessionStorage.setItem("rt_previous_path", currentPath);
        }

        sessionStorage.setItem("rt_current_path", pathname);
    }, [pathname]);

    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
