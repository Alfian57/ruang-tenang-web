"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DashboardHubTab<T extends string = string> = {
  value: T;
  label: string;
  icon: LucideIcon;
};

type DashboardHubTabsProps<T extends string> = {
  tabs: readonly DashboardHubTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  children: ReactNode;
  className?: string;
};

/** Shared compact tab navigation used by member dashboard hubs. */
export function DashboardHubTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  children,
  className,
}: DashboardHubTabsProps<T>) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as T)}
      className={className}
    >
      <TabsList className="mb-6">
        {tabs.map(({ value: tabValue, label, icon: Icon }) => (
          <TabsTrigger key={tabValue} value={tabValue} className="shrink-0 gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function DashboardPanelLoading({ label }: { label: string }) {
  return (
    <div
      className="min-h-72 animate-pulse rounded-2xl border bg-white/70"
      aria-label={label}
    />
  );
}

export { TabsContent };
