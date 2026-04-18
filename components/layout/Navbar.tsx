"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { usePathname } from "next/navigation";

interface NavbarProps {
  variant?: "default" | "back";
  backHref?: string;
  backLabel?: string;
}

const LANDING_SECTION_ROUTES = {
  FEATURES: `${ROUTES.HOME}#features`,
  GAMIFICATION: `${ROUTES.HOME}#gamification`,
  ARTICLES: `${ROUTES.HOME}#articles`,
} as const;

type NavSection = "home" | "features" | "gamification" | "articles";

const NAV_ITEMS: Array<{ key: NavSection; label: string; href: string }> = [
  { key: "home", label: "Beranda", href: ROUTES.HOME },
  { key: "gamification", label: "Gamifikasi", href: LANDING_SECTION_ROUTES.GAMIFICATION },
  { key: "features", label: "Fitur", href: LANDING_SECTION_ROUTES.FEATURES },
  { key: "articles", label: "Artikel", href: LANDING_SECTION_ROUTES.ARTICLES },
];

export function Navbar({ variant = "default", backHref = ROUTES.HOME, backLabel = "Kembali ke Beranda" }: NavbarProps) {
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<NavSection>("home");

  const activeLinkClass = useMemo(
    () => "px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-full transition-colors",
    []
  );

  const inactiveLinkClass = useMemo(
    () => "px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-colors",
    []
  );

  useEffect(() => {
    if (variant !== "default" || pathname !== ROUTES.HOME) {
      setActiveSection("home");
      return;
    }

    const sectionIds: NavSection[] = ["gamification", "features", "articles"];
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sectionElements.length === 0) {
      setActiveSection("home");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (window.scrollY < 180) {
          setActiveSection("home");
          return;
        }

        if (visibleEntries.length > 0) {
          const topMost = visibleEntries.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
          );

          const sectionId = topMost.target.id as NavSection;
          if (sectionId === "features" || sectionId === "gamification" || sectionId === "articles") {
            setActiveSection(sectionId);
          }
        }
      },
      {
        root: null,
        threshold: [0.2, 0.5, 0.8],
        rootMargin: "-20% 0px -50% 0px",
      }
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => {
      sectionElements.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [pathname, variant]);

  const isNavItemActive = (section: NavSection) => {
    if (pathname !== ROUTES.HOME) {
      return section === "home";
    }
    return section === activeSection;
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-[15px] shadow-lg px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Image
            src="/logo-full.webp"
            alt="Ruang Tenang"
            width={120}
            height={40}
            className="object-contain h-8 w-auto"
            style={{ width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="flex">
          {variant === "default" ? (
            <>
              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isNavItemActive(item.key);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={active ? activeLinkClass : inactiveLinkClass}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-2 ml-4">
                {isAuthenticated ? (
                  <Link href={ROUTES.DASHBOARD}>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href={ROUTES.LOGIN}>
                    <Button
                      variant="outline"
                      className="text-gray-700 hover:text-primary border-gray-200 hover:border-primary rounded-full px-6"
                    >
                      Masuk
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <Link href={backHref}>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button - Hide if variant is 'back' on mobile since we show nothing or maybe just valid menu? 
            Actually if variant is 'back', we might want to hide the hamburger menu entirely as there are no links 
        */}
        {variant === "default" && (
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 bg-white rounded-2xl shadow-lg p-4 space-y-2"
        >
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block px-4 py-3 font-medium rounded-xl transition-colors ${active
                  ? "text-primary bg-primary/5"
                  : "text-gray-600 hover:bg-primary/5 hover:text-primary"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t">
            {isAuthenticated ? (
              <Link href={ROUTES.DASHBOARD} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
                  Masuk
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
