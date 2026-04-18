"use client";

import type { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils";

type CompactTabItem = {
    value: string;
    label: ReactNode;
};

interface AdminCompactTabsProps {
    items: CompactTabItem[];
    className?: string;
    triggerClassName?: string;
}

export function AdminCompactTabs({ items, className, triggerClassName }: AdminCompactTabsProps) {
    return (
        <TabsList
            className={cn(
                "inline-flex h-11 items-center gap-1 rounded-full bg-gray-100 p-1 text-gray-500",
                className
            )}
        >
            {items.map((item) => (
                <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",
                        triggerClassName
                    )}
                >
                    {item.label}
                </TabsTrigger>
            ))}
        </TabsList>
    );
}
