"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
            aria-hidden="true"
        />
    );
}

// Card skeleton for articles, forums, etc.
export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("space-y-3 rounded-lg border p-4", className)} aria-busy="true" aria-label="Loading content">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center space-x-2 pt-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

// List item skeleton for simple list views
export function ListItemSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("flex items-center space-x-4 p-4", className)} aria-busy="true">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

// Avatar skeleton
export function AvatarSkeleton({ className }: SkeletonProps) {
    return (
        <Skeleton className={cn("h-10 w-10 rounded-full", className)} />
    );
}

// Text skeleton
export function TextSkeleton({ className, lines = 3 }: SkeletonProps & { lines?: number }) {
    return (
        <div className="space-y-2" aria-busy="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4",
                        i === lines - 1 ? "w-2/3" : "w-full",
                        className
                    )}
                />
            ))}
        </div>
    );
}

// Article card skeleton
export function ArticleCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border bg-card" aria-busy="true" aria-label="Loading article">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </div>
    );
}

// Chat message skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
    return (
        <div className={cn("flex gap-3", isUser && "flex-row-reverse")} aria-busy="true">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className={cn("max-w-[80%] space-y-2", isUser && "items-end")}>
                <Skeleton className="h-20 w-64 rounded-xl" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

// Forum post skeleton
export function ForumPostSkeleton() {
    return (
        <div className="space-y-4 rounded-lg border p-4" aria-busy="true" aria-label="Loading forum post">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <Skeleton className="h-5 w-3/4" />
            <TextSkeleton lines={2} />
            <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-8 w-16 rounded" />
            </div>
        </div>
    );
}

// Song card skeleton
export function SongCardSkeleton() {
    return (
        <div className="flex items-center gap-4 rounded-lg border p-3" aria-busy="true" aria-label="Loading song">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

// Stats card skeleton
export function StatsCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 space-y-2" aria-busy="true" aria-label="Loading stats">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr aria-busy="true">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

// Full page loading skeleton
export function PageSkeleton() {
    return (
        <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading page">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
            </div>
        </div>
    );
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4 rounded-lg border p-4">
                    <Skeleton className="h-6 w-32" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// Profile skeleton
export function ProfileSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
            <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
            </div>
        </div>
    );
}
