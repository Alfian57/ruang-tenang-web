"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils";

export type DashboardHubTab<T extends string = string> = {
  value: T;
  label: string;
  icon: LucideIcon;
};

/** Reusable, horizontally scrollable segmented navigation for dashboard hubs. */
export function DashboardHubTabList<T extends string>({
  tabs,
  className,
  tourTarget,
}: {
  tabs: readonly DashboardHubTab<T>[];
  className?: string;
  tourTarget?: string;
}) {
  return (
    <TabsList data-user-tour={tourTarget} className={cn("mb-5 h-auto w-fit max-w-full gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 shadow-none [scrollbar-width:thin]", className)}>
      {tabs.map(({ value, label, icon: Icon }) => (
        <TabsTrigger key={value} value={value} className="shrink-0 gap-1.5 rounded-lg px-3 py-2 text-xs data-[state=active]:text-theme-accent-dark sm:text-sm">
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

type DashboardHubTabsProps<T extends string> = {
  tabs: readonly DashboardHubTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  tabListTourTarget?: string;
};

/** Shared compact tab navigation used by member dashboard hubs. */
export function DashboardHubTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  children,
  className,
  compact = false,
  tabListTourTarget,
}: DashboardHubTabsProps<T>) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as T)}
      className={className}
    >
      {compact ? <DashboardHubTabList tabs={tabs} tourTarget={tabListTourTarget} /> : (
        <TabsList className="theme-accent-border-soft mb-6 flex h-auto max-w-full justify-start gap-1 overflow-x-auto rounded-2xl border bg-white/85 p-1.5 shadow-sm [scrollbar-width:thin]">
          {tabs.map(({ value: tabValue, label, icon: Icon }) => (
            <TabsTrigger key={tabValue} value={tabValue} className="shrink-0 gap-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
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
