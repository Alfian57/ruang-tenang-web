"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { useAuthStore } from "@/store/authStore";
import { CommunityStatsCard } from "@/components/shared/gamification";
import { Users, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useCommunityData } from "./_hooks/useCommunityData";
import {
  CommunitySkeleton,
  LatestDiscussions,
  PublicHallOfFame,
} from "./_components";

export default function CommunityPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [backHref, setBackHref] = useState<string>(ROUTES.HOME);
  const [backLabel, setBackLabel] = useState("Kembali ke Beranda");
  const {
    communityStats,
    hallOfFame,
    latestForums,
    currentLevel,
    loading,
    handleLevelChange,
  } = useCommunityData({ includePersonal: false });

  useEffect(() => {
    if (token) {
      router.replace(ROUTES.DASHBOARD_COMMUNITY);
    }
  }, [token, router]);

  useEffect(() => {
    const previousPath = sessionStorage.getItem("rt_previous_path") ?? "";

    if (previousPath.startsWith(ROUTES.DASHBOARD)) {
      setBackHref(ROUTES.DASHBOARD);
      setBackLabel("Kembali ke Dashboard");
      return;
    }

    if (previousPath === ROUTES.HOME) {
      setBackHref(ROUTES.HOME);
      setBackLabel("Kembali ke Beranda");
      return;
    }

    setBackHref(ROUTES.HOME);
    setBackLabel("Kembali ke Beranda");
  }, []);

  if (token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="back" backHref={backHref} backLabel={backLabel} />

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-20 left-0 w-100 h-100 bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="pt-32 pb-20 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Komunitas <span className="text-primary">Ruang Tenang</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Tempat kita tumbuh bersama. Rayakan pencapaian, dukung perjalanan satu sama lain,
            dan jadilah bagian dari komunitas yang penuh empati.
          </motion.p>
        </div>

        {loading ? (
          <CommunitySkeleton />
        ) : (
          <>
            {/* Community Stats */}
            {communityStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Pencapaian Komunitas
                </h2>
                <CommunityStatsCard stats={communityStats} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border p-8 text-center mb-12"
            >
              <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Masuk untuk Melihat Perjalananmu
              </h3>
              <p className="text-muted-foreground mb-6">
                Dapatkan akses ke statistik personal, badge, dan fitur eksklusif!
              </p>
              <Link href={ROUTES.LOGIN}>
                <Button size="lg">Masuk Sekarang</Button>
              </Link>
            </motion.div>

            {/* Latest Discussions */}
            <LatestDiscussions forums={latestForums} />

            {/* Public Hall of Fame */}
            {hallOfFame && (
              <PublicHallOfFame
                hallOfFame={hallOfFame}
                currentLevel={currentLevel}
                onLevelChange={handleLevelChange}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
