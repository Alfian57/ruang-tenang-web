"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  HOME: `${ROUTES.HOME}#home`,
  FEATURES: `${ROUTES.HOME}#features`,
  JOURNEY: `${ROUTES.HOME}#journey`,
  COMMUNITY: `${ROUTES.HOME}#community`,
  ARTICLES: `${ROUTES.HOME}#articles`,
} as const;

type NavSection = "home" | "features" | "journey" | "community" | "articles";

const NAV_ITEMS: Array<{ key: NavSection; label: string; href: string }> = [
  { key: "home", label: "Beranda", href: LANDING_SECTION_ROUTES.HOME },
  { key: "features", label: "Fitur", href: LANDING_SECTION_ROUTES.FEATURES },
  { key: "journey", label: "Perjalanan", href: LANDING_SECTION_ROUTES.JOURNEY },
  { key: "community", label: "Komunitas", href: LANDING_SECTION_ROUTES.COMMUNITY },
  { key: "articles", label: "Artikel", href: LANDING_SECTION_ROUTES.ARTICLES },
];

export function Navbar({ variant = "default", backHref = ROUTES.HOME, backLabel = "Kembali ke Beranda" }: NavbarProps) {
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const activeLinkClass = useMemo(
    () => "whitespace-nowrap px-3 py-2 text-sm font-medium text-primary bg-primary/5 rounded-full transition-colors xl:px-4",
    []
  );

  const inactiveLinkClass = useMemo(
    () => "whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-colors xl:px-4",
    []
  );

  useEffect(() => {
    if (variant !== "default" || pathname !== ROUTES.HOME) {
      setActiveSection("home");
      return;
    }

    const updateActiveSection = () => {
      if (window.scrollY < 120) {
        setActiveSection("home");
        return;
      }

      const activationPoint = window.scrollY + Math.min(window.innerHeight * 0.35, 320);

      const nextSection = NAV_ITEMS.reduce<NavSection>((currentSection, item) => {
        const section = document.getElementById(item.key);

        if (!section) {
          return currentSection;
        }

        const sectionTop = section.getBoundingClientRect().top + window.scrollY;

        if (sectionTop <= activationPoint) {
          return item.key;
        }

        return currentSection;
      }, "home");

      setActiveSection((currentSection) => currentSection === nextSection ? currentSection : nextSection);
    };

    let frameId: number | null = null;

    const requestActiveSectionUpdate = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateActiveSection();
      });
    };

    const updateActiveSectionFromHash = () => {
      const hashSection = NAV_ITEMS.find((item) => item.key === window.location.hash.slice(1));

      if (hashSection) {
        setActiveSection(hashSection.key);
      }

      window.setTimeout(requestActiveSectionUpdate, 120);
    };

    updateActiveSectionFromHash();
    requestActiveSectionUpdate();

    window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
    window.addEventListener("resize", requestActiveSectionUpdate);
    window.addEventListener("hashchange", updateActiveSectionFromHash);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestActiveSectionUpdate);
      window.removeEventListener("resize", requestActiveSectionUpdate);
      window.removeEventListener("hashchange", updateActiveSectionFromHash);
    };
  }, [pathname, variant]);

  useEffect(() => {
    const updateScrollInfo = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 60);
    };

    updateScrollInfo();
    window.addEventListener("scroll", updateScrollInfo, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollInfo);
  }, []);

  const isNavItemActive = (section: NavSection) => {
    if (pathname !== ROUTES.HOME) {
      return section === "home";
    }
    return section === activeSection;
  };

  return (
    <motion.nav
      initial={shouldReduceMotion ? false : { y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-6xl sm:top-4 sm:w-[95%]"
    >
      <div className={`relative flex min-w-0 items-center justify-between overflow-hidden bg-white/95 px-3 py-3 backdrop-blur-md min-[380px]:px-4 md:px-6 transition-shadow duration-300 ${variant === "default" ? "rounded-full border border-white/90 shadow-[0_16px_45px_-26px_rgba(114,66,94,0.45)]" : "rounded-full border border-[#f3e2e1] shadow-[0_16px_45px_-26px_rgba(114,66,94,0.45)]"} ${isScrolled ? "shadow-xl shadow-gray-900/10" : "shadow-lg"}`}>
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex min-w-0 items-center gap-2">
          <Image
            src="/logo-full.webp"
            alt="Ruang Tenang"
            width={120}
            height={40}
            className="h-7 w-auto object-contain min-[380px]:h-8"
            style={{ width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="flex">
          {variant === "default" ? (
            <>
              <div className="hidden xl:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isNavItemActive(item.key);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      aria-current={active ? "location" : undefined}
                      className={active ? activeLinkClass : inactiveLinkClass}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="hidden xl:flex items-center gap-2 ml-3">
                {isAuthenticated ? (
                  <Link href={ROUTES.DASHBOARD}>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href={ROUTES.LOGIN}><Button className="rounded-full bg-[#d94f5c] px-6 text-white hover:bg-[#bd3d4e]">Masuk</Button></Link>
                )}
              </div>
            </>
          ) : (
            <Link href={backHref}>
              <Button
                variant="ghost"
                className="gap-2 rounded-full px-3 text-gray-600 hover:bg-primary/5 hover:text-primary sm:px-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="min-[420px]:hidden">Kembali</span>
                <span className="hidden min-[420px]:inline">{backLabel}</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button - Hide if variant is 'back' on mobile since we show nothing or maybe just valid menu? 
            Actually if variant is 'back', we might want to hide the hamburger menu entirely as there are no links 
        */}
        {variant === "default" && (
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            className="xl:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-slate-200/40" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          id="landing-mobile-menu"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:hidden mt-2 max-h-[calc(100svh-5.5rem)] overflow-y-auto rounded-2xl bg-white p-3 shadow-lg space-y-1.5 min-[380px]:p-4 min-[380px]:space-y-2"
        >
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "location" : undefined}
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
              <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}><Button className="w-full rounded-full bg-[#d94f5c] text-white hover:bg-[#bd3d4e]">Masuk</Button></Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
