"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AlertTriangle, ChevronRight, Crown, Lock, MessageCircle, PanelLeftClose } from "lucide-react";
import { cn } from "@/utils";
import { adminGroups, memberGroups, memberHighlightLink, mitraGroups, mitraHighlightLink, type NavGroup } from "./nav-config";
import { ROUTES } from "@/lib/routes";
import type { BillingStatus } from "@/types";

interface SidebarProps {
  userRole: "admin" | "user" | "mitra";
  billingStatus?: BillingStatus | null;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onCloseSidebar: () => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({
  userRole,
  billingStatus,
  sidebarOpen,
  sidebarCollapsed,
  onCloseSidebar,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";
  const homeHref = isAdmin
    ? ROUTES.ADMIN.DASHBOARD
    : userRole === "mitra"
      ? ROUTES.MITRA.DASHBOARD
      : ROUTES.DASHBOARD;

  const groups: NavGroup[] = isAdmin
    ? adminGroups
    : userRole === "mitra"
      ? mitraGroups
      : memberGroups;

  const highlightLink = userRole === "user"
    ? memberHighlightLink
    : userRole === "mitra"
      ? mitraHighlightLink
      : null;
  const quota = billingStatus?.chat_quota;
  const isPremiumAccess = Boolean(billingStatus?.is_premium || quota?.is_unlimited);
  const isChatLimitExhausted = userRole === "user" && Boolean(quota && !isPremiumAccess && quota.remaining <= 0);
  const isChatQuotaLow = userRole === "user" && Boolean(
    quota &&
    !isPremiumAccess &&
    quota.remaining > 0 &&
    quota.remaining <= Math.max(1, Math.ceil(quota.limit * 0.25))
  );
  const chatAccessState = userRole !== "user"
    ? null
    : isPremiumAccess
      ? {
        tone: "premium" as const,
        label: "Unlimited",
        subtitle: "Premium aktif, chat tanpa batas",
        icon: Crown,
      }
      : isChatLimitExhausted
        ? {
          tone: "locked" as const,
          label: "Limit habis",
          subtitle: "Kuota gratis habis, lihat opsi lanjut",
          icon: Lock,
        }
        : isChatQuotaLow
          ? {
            tone: "low" as const,
            label: `${quota?.remaining ?? 0} sisa`,
            subtitle: `Sisa ${quota?.remaining ?? 0} chat periode ini`,
            icon: AlertTriangle,
          }
          : quota
            ? {
              tone: "available" as const,
              label: `${quota.remaining}/${quota.limit}`,
              subtitle: "Kuota chat gratis periode ini",
              icon: MessageCircle,
            }
            : null;

  const getLinkBadge = (href: string) => {
    if (userRole !== "user" || isPremiumAccess) return null;
    if (href === ROUTES.BILLING) return { label: "Upgrade", tone: "premium" as const, icon: Crown };
    return null;
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onCloseSidebar}
          aria-label="Tutup navigasi"
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={cn(
          "sidebar-themed fixed top-0 left-0 h-full max-w-[calc(100vw-1rem)] bg-white border-r z-40 transform transition-all duration-200",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-20" : "lg:w-60",
          "w-60"
        )}>
        {/* Logo */}
        <div className="p-4 h-16 flex items-center justify-between border-b">
          <Link href={homeHref} className="flex min-w-0 items-center gap-2">
            {sidebarCollapsed ? (
              <Image src="/logo.webp" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
            ) : (
              <Image src="/logo-full.webp" alt="Ruang Tenang" width={120} height={40} className="h-8 w-auto object-contain" style={{ width: "auto" }} />
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="sidebar-collapse-btn hidden lg:flex w-8 h-8 rounded-lg bg-gray-100 items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Ciutkan sidebar"
              aria-expanded={!sidebarCollapsed}
              aria-controls="dashboard-sidebar"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Toggle button for collapsed state */}
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="sidebar-expand-btn absolute top-16 -right-3 hidden lg:flex w-6 h-6 rounded-full bg-white border shadow-sm items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Perluas sidebar"
            aria-expanded={!sidebarCollapsed}
            aria-controls="dashboard-sidebar"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Navigation */}
        <nav className="py-4 overflow-y-auto h-[calc(100vh-10rem)]" aria-label="Navigasi dashboard">
          {/* AI Chat highlight - rendered before groups */}
          {highlightLink && (() => {
            const isActive = userRole === "mitra"
              ? pathname === highlightLink.href
              : pathname === highlightLink.href || pathname.startsWith(`${highlightLink.href}/`);
            const Icon = highlightLink.icon;
            const StatusIcon = chatAccessState?.icon;
            const highlightTitle = sidebarCollapsed && chatAccessState
              ? `${highlightLink.label} - ${chatAccessState.label}`
              : sidebarCollapsed
                ? highlightLink.label
                : undefined;
            const highlightSubtitle = userRole === "mitra"
              ? "Kelola organisasi & seat"
              : chatAccessState?.subtitle ?? "Apa pun, kapan pun";
            return (
              <Link
                href={highlightLink.href}
                onClick={onCloseSidebar}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "sidebar-ai-card mx-3 min-w-0 px-4 py-3.5 rounded-2xl relative mb-4 block",
                  chatAccessState?.tone === "locked" && "limited",
                  chatAccessState?.tone === "low" && "low-quota",
                  isActive && "active",
                  sidebarCollapsed && "lg:mx-2 lg:px-3 lg:py-2.5"
                )}
                title={highlightTitle}
              >
                <div className={cn("flex items-center gap-3 relative z-10", sidebarCollapsed && "lg:justify-center")}>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate font-semibold text-sm text-white">
                          {highlightLink.label}
                        </span>
                        {chatAccessState && StatusIcon && (
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              chatAccessState.tone === "locked" && "border-amber-200 bg-amber-100 text-amber-900",
                              chatAccessState.tone === "low" && "border-amber-100 bg-white/90 text-amber-700",
                              chatAccessState.tone === "premium" && "border-violet-100 bg-white/90 text-violet-700",
                              chatAccessState.tone === "available" && "border-white/25 bg-white/15 text-white"
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {chatAccessState.label}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block truncate text-[10.5px] leading-tight text-white/70">
                        {highlightSubtitle}
                      </span>
                    </div>
                  )}
                </div>
                {sidebarCollapsed && StatusIcon && chatAccessState?.tone !== "available" && (
                  <span
                    className={cn(
                      "absolute -right-1 -top-1 z-20 grid h-5 w-5 place-items-center rounded-full border-2 border-white shadow-sm",
                      chatAccessState?.tone === "locked" && "bg-amber-500 text-white",
                      chatAccessState?.tone === "low" && "bg-orange-500 text-white",
                      chatAccessState?.tone === "premium" && "bg-violet-500 text-white"
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                  </span>
                )}
              </Link>
            );
          })()}

          {groups.map((group, groupIdx) => (
            <div key={group.title} className={cn(groupIdx > 0 && "mt-4")}>
              {/* Group title */}
              {!sidebarCollapsed ? (
                <div className="px-6 mb-1">
                  <span className="sidebar-group-title text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {group.title}
                  </span>
                </div>
              ) : (
                groupIdx > 0 && (
                  <div className="sidebar-group-divider mx-4 mb-2 border-t border-gray-100" />
                )
              )}

              {/* Group links */}
              {group.links.map((link) => {
                const badge = getLinkBadge(link.href);
                const BadgeIcon = badge?.icon;
                const normalizedLinkHref = link.href.split("#")[0];
                const normalizedPathname = pathname.split("#")[0];
                const isDashboardLink =
                  normalizedLinkHref === ROUTES.DASHBOARD ||
                  normalizedLinkHref === ROUTES.ADMIN.DASHBOARD ||
                  normalizedLinkHref === ROUTES.MITRA.DASHBOARD;
                const isDashboardPath =
                  normalizedPathname === ROUTES.DASHBOARD ||
                  normalizedPathname === ROUTES.ADMIN.DASHBOARD ||
                  normalizedPathname === ROUTES.MITRA.DASHBOARD;

                const isActive = isDashboardLink
                  ? isDashboardPath
                  : normalizedPathname === normalizedLinkHref || normalizedPathname.startsWith(`${normalizedLinkHref}/`);

                const inactiveClass = link.secondary
                  ? "text-gray-500 hover:bg-gray-50"
                  : "text-gray-600 hover:bg-gray-100";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onCloseSidebar}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "sidebar-nav-link flex min-w-0 items-center gap-3 mx-3 px-4 py-2.5 rounded-xl transition-all relative mb-0.5",
                      isActive
                        ? "sidebar-nav-active text-white bg-primary shadow-md"
                        : inactiveClass,
                      sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                    )}
                    title={sidebarCollapsed ? link.label : undefined}
                  >
                    <link.icon
                      className={cn(
                        "sidebar-nav-icon w-5 h-5 shrink-0",
                        isActive ? "text-white" : link.secondary ? "text-gray-400" : "text-gray-500"
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className={cn(
                        "font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis",
                        link.secondary && !isActive && "text-sm"
                      )}>
                        {link.label}
                      </span>
                    )}
                    {!sidebarCollapsed && badge && BadgeIcon && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-center p-2">
            <span className="text-xs text-gray-400">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
