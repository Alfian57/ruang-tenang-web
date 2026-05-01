"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ROUTES } from "@/lib/routes";
import { MitraFeatureTour } from "./_components/MitraFeatureTour";

export default function MitraLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider requireAuth requireMitra redirectTo={ROUTES.LOGIN}>
            {children}
            <MitraFeatureTour />
        </AuthProvider>
    );
}
