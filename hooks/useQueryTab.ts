"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UseQueryTabOptions<T extends string> = {
  defaultTab: T;
  validTabs: ReadonlySet<T>;
  buildRoute: (tab: T) => string;
};

/** Keeps a hub tab in the URL while normalizing the canonical default route. */
export function useQueryTab<T extends string>({
  defaultTab,
  validTabs,
  buildRoute,
}: UseQueryTabOptions<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab = rawTab && validTabs.has(rawTab as T) ? (rawTab as T) : defaultTab;

  useEffect(() => {
    if (rawTab === defaultTab || (rawTab && !validTabs.has(rawTab as T))) {
      router.replace(buildRoute(defaultTab), { scroll: false });
    }
  }, [buildRoute, defaultTab, rawTab, router, validTabs]);

  const setActiveTab = useCallback(
    (tab: T) => router.push(buildRoute(tab), { scroll: false }),
    [buildRoute, router]
  );

  return { activeTab, setActiveTab };
}
