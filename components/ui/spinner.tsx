import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
    variants: {
        size: {
            default: "h-4 w-4",
            sm: "h-3 w-3",
            md: "h-6 w-6",
            lg: "h-8 w-8",
            xl: "h-12 w-12",
        },
        variant: {
            default: "text-primary",
            muted: "text-muted-foreground",
            white: "text-white",
            current: "text-current",
        },
    },
    defaultVariants: {
        size: "default",
        variant: "default",
    },
});

export interface SpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
    label?: string;
}

function Spinner({ className, size, variant, label, ...props }: SpinnerProps) {
    return (
        <div
            className={cn("inline-flex items-center gap-2", className)}
            role="status"
            aria-label={label || "Loading"}
            {...props}
        >
            <Loader2 className={spinnerVariants({ size, variant })} aria-hidden="true" />
            {label && <span className="text-sm text-muted-foreground">{label}</span>}
            <span className="sr-only">{label || "Loading..."}</span>
        </div>
    );
}

// Full page loading spinner
interface PageLoaderProps {
    message?: string;
}

function PageLoader({ message = "Memuat..." }: PageLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Spinner size="xl" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}

// Inline loading for buttons, etc.
interface InlineLoaderProps {
    text?: string;
    className?: string;
}

function InlineLoader({ text, className }: InlineLoaderProps) {
    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <Spinner size="sm" variant="current" />
            {text && <span>{text}</span>}
        </span>
    );
}

export { Spinner, spinnerVariants, PageLoader, InlineLoader };
