"use client";

import * as React from "react";
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
    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
