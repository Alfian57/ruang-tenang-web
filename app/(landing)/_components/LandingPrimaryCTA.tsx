"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";

export function LandingPrimaryCTA() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER} className="landing-button-primary">
      {isAuthenticated ? "Buka Dashboard" : "Mulai Gratis"}
      <ArrowRight size={19} aria-hidden="true" />
    </Link>
  );
}
