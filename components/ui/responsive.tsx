"use client";

import { cn } from "@/utils";
import { forwardRef } from "react";

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Maximum width of container */
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    /** Padding on sides */
    padding?: "none" | "sm" | "md" | "lg";
    /** Center the container */
    centered?: boolean;
}

const maxWidthClasses = {
    sm: "max-w-screen-sm", // 640px
    md: "max-w-screen-md", // 768px
    lg: "max-w-screen-lg", // 1024px
    xl: "max-w-screen-xl", // 1280px
    "2xl": "max-w-screen-2xl", // 1536px
    full: "max-w-full",
};

const paddingClasses = {
    none: "px-0",
    sm: "px-4 sm:px-6",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-4 sm:px-8 lg:px-12",
};

/**
 * Responsive container with proper padding for different screen sizes
 */
export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
    ({ className, maxWidth = "xl", padding = "md", centered = true, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "w-full",
                    maxWidthClasses[maxWidth],
                    paddingClasses[padding],
                    centered && "mx-auto",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
ResponsiveContainer.displayName = "ResponsiveContainer";

/**
 * Responsive grid with automatic column adjustment
 */
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Minimum column width */
    minColWidth?: string;
    /** Gap between items */
    gap?: "sm" | "md" | "lg";
    /** Fixed columns per breakpoint */
    cols?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

const gapClasses = {
    sm: "gap-2 sm:gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
};

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
    ({ className, minColWidth, gap = "md", cols, children, style, ...props }, ref) => {
        const colClasses = cols
            ? cn(
                cols.default && `grid-cols-${cols.default}`,
                cols.sm && `sm:grid-cols-${cols.sm}`,
                cols.md && `md:grid-cols-${cols.md}`,
                cols.lg && `lg:grid-cols-${cols.lg}`,
                cols.xl && `xl:grid-cols-${cols.xl}`
            )
            : "";

        return (
            <div
                ref={ref}
                className={cn("grid", gapClasses[gap], colClasses, className)}
                style={
                    minColWidth
                        ? {
                            gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}, 1fr))`,
                            ...style,
                        }
                        : style
                }
                {...props}
            >
                {children}
            </div>
        );
    }
);
ResponsiveGrid.displayName = "ResponsiveGrid";

/**
 * Stack component for vertical/horizontal layouts
 */
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: "vertical" | "horizontal";
    gap?: "xs" | "sm" | "md" | "lg" | "xl";
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "between" | "around";
    wrap?: boolean;
}

const stackGapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
};

const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
};

const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
    (
        {
            className,
            direction = "vertical",
            gap = "md",
            align = "stretch",
            justify = "start",
            wrap = false,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex",
                    direction === "vertical" ? "flex-col" : "flex-row",
                    stackGapClasses[gap],
                    alignClasses[align],
                    justifyClasses[justify],
                    wrap && "flex-wrap",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Stack.displayName = "Stack";

/**
 * Hide component on specific breakpoints
 */
interface HideProps extends React.HTMLAttributes<HTMLDivElement> {
    below?: "sm" | "md" | "lg" | "xl";
    above?: "sm" | "md" | "lg" | "xl";
}

const hideBelowClasses = {
    sm: "hidden sm:block",
    md: "hidden md:block",
    lg: "hidden lg:block",
    xl: "hidden xl:block",
};

const hideAboveClasses = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
    xl: "xl:hidden",
};

export const Hide = forwardRef<HTMLDivElement, HideProps>(
    ({ className, below, above, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    below && hideBelowClasses[below],
                    above && hideAboveClasses[above],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Hide.displayName = "Hide";

/**
 * Mobile-only component (hidden on md and above)
 */
export function MobileOnly({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("md:hidden", className)} {...props}>
            {children}
        </div>
    );
}

/**
 * Desktop-only component (hidden below md)
 */
export function DesktopOnly({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("hidden md:block", className)} {...props}>
            {children}
        </div>
    );
}

/**
 * Breakpoint utility classes
 */
export const breakpoints = {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
} as const;

/**
 * Touch target minimum size (WCAG 2.5.5)
 */
export const TOUCH_TARGET_SIZE = 44;

/**
 * Utility classes for touch-friendly targets
 */
export const touchTargetStyles = {
    button: "min-h-[44px] min-w-[44px]",
    iconButton: "h-11 w-11 p-2.5",
    link: "py-2.5 inline-flex items-center",
    listItem: "min-h-[44px] py-2.5 px-4",
};

/**
 * Safe area padding for mobile devices with notches
 */
export const safeAreaClasses = {
    top: "pt-[env(safe-area-inset-top)]",
    bottom: "pb-[env(safe-area-inset-bottom)]",
    left: "pl-[env(safe-area-inset-left)]",
    right: "pr-[env(safe-area-inset-right)]",
    all: "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
};
