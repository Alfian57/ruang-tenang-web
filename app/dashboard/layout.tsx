"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  FileText, 
  LogOut,
  Menu,
  X,
  Users,
  Search,
  Bell,
  ChevronRight,
  Music,
  LayoutDashboard,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoutModal } from "@/components/ui/logout-modal";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

// Member menu items (for regular users)
const memberLinks = [
  { href: "/dashboard", icon: "/images/home.png", activeIcon: "/images/home-active.png", label: "Beranda", badge: "12" },
  { href: "/dashboard/articles", icon: "/images/article.png", activeIcon: "/images/article-active.png", label: "Artikel" },
  { href: "/dashboard/chat", icon: "/images/ai-chat.png", activeIcon: "/images/ai-chat-active.png", label: "AI Chat", badge: "8" },
];

// Admin menu items (for admin only)
const adminLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/admin/users", icon: Users, label: "Pengguna" },
  { href: "/dashboard/admin/articles", icon: FileText, label: "Kelola Artikel" },
  { href: "/dashboard/admin/songs", icon: Music, label: "Kelola Musik" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requireAuth redirectTo="/login">
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
          <span className="text-lg font-bold text-gray-800">Ruang Tenang</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r z-50 transform transition-all duration-200",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-20" : "lg:w-60",
        "w-60"
      )}>
        {/* Logo */}
        <div className="p-4 h-16 flex items-center justify-between border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
          {sidebarCollapsed ? (
            <Image src="/logo.png" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
          ): (
            <Image src="/logo-full.png" alt="Ruang Tenang" width={sidebarCollapsed ? 32 : 120} height={32} className="object-contain" />
          )}
          </Link>
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 rounded-lg bg-gray-100 items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Image src="/images/sidebar-toggle.png" alt="" width={16} height={16} />
            </button>
          )}
        </div>

        {/* Toggle button for collapsed state */}
        {sidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-16 -right-3 hidden lg:flex w-6 h-6 rounded-full bg-white border shadow-sm items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Navigation */}
        <nav className="py-6 overflow-y-auto h-[calc(100vh-10rem)]">
          {/* Show different menus based on role */}
          {isAdmin ? (
            // Admin sees only admin links
            adminLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all relative",
                    isActive 
                      ? "text-white bg-primary shadow-md" 
                      : "text-gray-600 hover:bg-gray-100",
                    sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                  )}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{link.label}</span>}
                </Link>
              );
            })
          ) : (
            // Member sees only member links
            memberLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all relative mb-1",
                    isActive 
                      ? "text-white bg-primary shadow-md" 
                      : "text-gray-600 hover:bg-gray-100",
                    sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                  )}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  <Image 
                    src={isActive ? link.activeIcon : link.icon} 
                    alt="" 
                    width={22} 
                    height={22}
                    className={cn("shrink-0", isActive && "brightness-0 invert")}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1">{link.label}</span>
                      {link.badge && (
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full font-medium",
                          isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        )}>
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors w-full rounded-xl",
              sidebarCollapsed && "lg:justify-center lg:px-3"
            )}
            title={sidebarCollapsed ? "Keluar" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-200",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
      )}>
        {/* Top Header */}
        <header className="hidden lg:flex h-16 bg-white border-b items-center justify-end px-6 sticky top-0 z-40">
          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari sesuatu" 
                className="pl-11 pr-4 w-64 bg-gray-100 border-0 rounded-full h-10"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative rounded-full bg-gray-100 hover:bg-gray-200">
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
            {/* Profile dropdown */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                <span className="text-primary font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
