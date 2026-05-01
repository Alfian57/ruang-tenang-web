"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { User } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import { LandingDataNotice } from "./LandingDataNotice";

export default function LeaderboardSection() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await communityService.getLeaderboard(3);
        setUsers(response.data || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const featuredMembers = users.slice(0, 3);

  return (
    <section id="leaderboard" className="relative overflow-hidden bg-linear-to-b from-white via-rose-50/55 to-white px-4 py-14 sm:py-16 md:py-20">
      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
            <User className="h-4 w-4" />
            Hall of Fame
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-5xl"
          >
            Hall of Fame <span className="text-primary">Publik</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg"
          >
            Apresiasi publik untuk member yang aktif berbagi ketenangan dan dukungan di komunitas.
          </motion.p>
          <div className="mt-5">
            <LandingDataNotice variant="public" />
          </div>
        </div>

        {loading ? (
          <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-rose-100 bg-white/85 p-6">
                <div className="w-20 h-20 mx-auto mt-2 mb-4 rounded-2xl bg-gray-100" />
                <div className="h-6 bg-gray-100 rounded w-2/3 mx-auto mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-3" />
                <div className="h-8 bg-gray-100 rounded-full w-24 mx-auto" />
              </div>
            ))}
          </div>
        ) : featuredMembers.length === 0 ? (
          <div className="mx-auto mb-10 max-w-4xl rounded-2xl border border-dashed border-rose-200 bg-white/80 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Leaderboard belum memiliki data</p>
            <p className="text-sm text-gray-500">
              Belum ada member yang masuk ranking saat ini. Aktivitas komunitas berikutnya akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {featuredMembers.map((member, index) => (
              <motion.div
                key={`${member.user_id ?? "anonymous"}-${member.rank ?? index}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-xl shadow-red-950/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-950/10"
              >
                {member.avatar ? (
                  <div className="relative w-20 h-20 mt-2 rounded-2xl mb-4 shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 mt-2 bg-linear-to-br from-primary/80 to-red-600 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                  {member.name}
                </h3>
                <p className="text-gray-500 font-medium mb-2">{member.role || member.badge_name}</p>

                <div className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">
                  {member.exp.toLocaleString()} EXP
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href={ROUTES.HALL_OF_FAME} className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            <span>Lihat Hall of Fame</span>
            <User size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
