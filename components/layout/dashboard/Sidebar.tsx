"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeftClose } from "lucide-react";
import { cn } from "@/utils";
import { adminGroups, moderatorGroups, memberGroups, memberHighlightLink, type NavGroup } from "./nav-config";
import { ROUTES } from "@/lib/routes";

interface SidebarProps {
  isAdmin: boolean;
  isModerator: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onCloseSidebar: () => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({
  isAdmin,
  isModerator,
  sidebarOpen,
  sidebarCollapsed,
  onCloseSidebar,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  const groups: NavGroup[] = isAdmin ? adminGroups : isModerator ? moderatorGroups : memberGroups;
  const isMember = !isAdmin && !isModerator;
  const highlightLink = isMember ? memberHighlightLink : null;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r z-40 transform transition-all duration-200",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-20" : "lg:w-60",
        "w-60"
      )}>
        {/* Logo */}
        <div className="p-4 h-16 flex items-center justify-between border-b">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            {sidebarCollapsed ? (
              <Image src="/logo.webp" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
            ) : (
              <Image src="/logo-full.webp" alt="Ruang Tenang" width={0} height={0} sizes="100vw" className="h-8 w-auto object-contain" style={{ width: "auto" }} />
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="hidden lg:flex w-8 h-8 rounded-lg bg-gray-100 items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Toggle button for collapsed state */}
        {sidebarCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className="absolute top-16 -right-3 hidden lg:flex w-6 h-6 rounded-full bg-white border shadow-sm items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Navigation */}
        <nav className="py-4 overflow-y-auto h-[calc(100vh-10rem)]">
          {/* AI Chat highlight - rendered before groups */}
          {highlightLink && (() => {
            const isActive = pathname === highlightLink.href || pathname.startsWith(highlightLink.href);
            const Icon = highlightLink.icon;
            return (
              <Link
                href={highlightLink.href}
                onClick={onCloseSidebar}
                className={cn(
                  "sidebar-ai-card mx-3 px-4 py-3.5 rounded-2xl relative mb-4 block",
                  isActive && "active",
                  sidebarCollapsed && "lg:mx-2 lg:px-3 lg:py-2.5"
                )}
                title={sidebarCollapsed ? highlightLink.label : undefined}
              >
                <div className={cn("flex items-center gap-3 relative z-10", sidebarCollapsed && "lg:justify-center")}>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-white block">
                        {highlightLink.label}
                      </span>
                      <span className="text-[10.5px] text-white/60 block mt-0.5 leading-tight">
                        Apa pun, kapan pun 💬
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })()}

          {groups.map((group, groupIdx) => (
            <div key={group.title} className={cn(groupIdx > 0 && "mt-4")}>
              {/* Group title */}
              {!sidebarCollapsed ? (
                <div className="px-6 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {group.title}
                  </span>
                </div>
              ) : (
                groupIdx > 0 && (
                  <div className="mx-4 mb-2 border-t border-gray-100" />
                )
              )}

              {/* Group links */}
              {group.links.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onCloseSidebar}
                    className={cn(
                      "flex items-center gap-3 mx-3 px-4 py-2.5 rounded-xl transition-all relative mb-0.5",
                      isActive
                        ? "text-white bg-primary shadow-md"
                        : "text-gray-600 hover:bg-gray-100",
                      sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                    )}
                    title={sidebarCollapsed ? link.label : undefined}
                  >
                    <link.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-gray-500")} />
                    {!sidebarCollapsed && (
                      <span className="font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {link.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-center p-2">
            <span className="text-xs text-gray-400">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
