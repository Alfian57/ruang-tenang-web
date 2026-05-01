"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ROUTES } from "@/lib/routes";

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requireAuth requireAdmin redirectTo={ROUTES.LOGIN}>
      {children}
    </AuthProvider>
  );
}
