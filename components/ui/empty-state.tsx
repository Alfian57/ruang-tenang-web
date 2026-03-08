import * as React from "react";
import { cn } from "@/utils";
import { FileQuestion, SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 text-center",
                className
            )}
        >
            <div className="mb-4">
                {icon || <FileQuestion className="w-16 h-16 text-gray-300" />}
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-400 max-w-sm">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick} variant="outline" className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

// Preset empty states for common use cases
export function NoSearchResults({
    query,
    onClear,
}: {
    query?: string;
    onClear?: () => void;
}) {
    return (
        <EmptyState
            icon={<SearchX className="w-16 h-16 text-gray-300" />}
            title="Tidak ada hasil"
            description={
                query
                    ? `Tidak ditemukan hasil untuk "${query}"`
                    : "Coba kata kunci lain atau filter berbeda"
            }
            action={onClear ? { label: "Hapus pencarian", onClick: onClear } : undefined}
        />
    );
}

export function NoData({
    title = "Belum ada data",
    description,
    action,
}: {
    title?: string;
    description?: string;
    action?: { label: string; onClick: () => void };
}) {
    return (
        <EmptyState
            icon={<FileQuestion className="w-16 h-16 text-gray-300" />}
            title={title}
            description={description}
            action={action}
        />
    );
}

// Error state component
interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = "Terjadi kesalahan",
    description = "Tidak dapat memuat data. Silakan coba lagi.",
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 text-center",
                className
            )}
        >
            <AlertCircle className="w-16 h-16 text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
            <p className="text-sm text-gray-400 max-w-sm">{description}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-4">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Coba lagi
                </Button>
            )}
        </div>
    );
}
