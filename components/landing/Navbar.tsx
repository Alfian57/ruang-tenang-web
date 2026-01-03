"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft } from "lucide-react";

interface NavbarProps {
  variant?: "default" | "back";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-[15px] shadow-lg px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-full.png"
            alt="Ruang Tenang"
            width={120}
            height={40}
            className="object-contain h-8 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="flex">
          {variant === "default" ? (
            <>
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  Beranda
                </Link>
                <Link
                  href="/#articles"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  Artikel
                </Link>
                <Link
                  href="/#leaderboard"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  Peringkat
                </Link>
                <Link
                  href="/#about"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  Tentang Kami
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-2 ml-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
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
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
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
          <Link
            href="/"
            className="block px-4 py-3 text-primary font-medium rounded-xl hover:bg-primary/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Beranda
          </Link>
          <Link
            href="/#articles"
            className="block px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Artikel
          </Link>
          <Link
            href="/#leaderboard"
            className="block px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Peringkat
          </Link>
          <Link
            href="/#about"
            className="block px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tentang Kami
          </Link>
          <div className="pt-2 border-t">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
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
