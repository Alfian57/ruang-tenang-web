"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
    href?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Skip to main content link for keyboard accessibility
 * Appears on focus for screen reader and keyboard users
 */
export function SkipLink({
    href = "#main-content",
    className,
    children = "Langsung ke konten utama"
}: SkipLinkProps) {
    return (
        <a
            href={href}
            className={cn(
                "sr-only focus:not-sr-only",
                "focus:fixed focus:top-4 focus:left-4 focus:z-100",
                "focus:px-4 focus:py-2 focus:rounded-lg",
                "focus:bg-primary focus:text-primary-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "transition-all",
                className
            )}
        >
            {children}
        </a>
    );
}

/**
 * Visually hidden component for screen reader only content
 */
export function VisuallyHidden({
    children,
    as: Component = "span"
}: {
    children: React.ReactNode;
    as?: React.ElementType;
}) {
    return (
        <Component className="sr-only">
            {children}
        </Component>
    );
}

/**
 * Live region for screen reader announcements
 */
export function LiveRegion({
    children,
    mode = "polite",
    atomic = true,
    className,
}: {
    children: React.ReactNode;
    mode?: "polite" | "assertive" | "off";
    atomic?: boolean;
    className?: string;
}) {
    return (
        <div
            role="status"
            aria-live={mode}
            aria-atomic={atomic}
            className={cn("sr-only", className)}
        >
            {children}
        </div>
    );
}

/**
 * Focus indicator ring for custom focus styles
 */
export const focusRingClasses =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Touch target sizes for mobile accessibility (44x44 minimum)
 */
export const touchTargetClasses = {
    button: "min-h-[44px] min-w-[44px]",
    link: "min-h-[44px] inline-flex items-center",
    icon: "p-2.5 min-h-[44px] min-w-[44px]",
};
