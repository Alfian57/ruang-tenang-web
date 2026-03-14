"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { User } from "lucide-react";
import { LeaderboardEntry } from "@/types";

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
    <section id="leaderboard" className="relative bg-linear-to-b from-red-50 to-white overflow-hidden pb-24 pt-32 -mt-10">
      {/* Decorative Wave Separator */}
      <div className="absolute top-0 left-0 right-0 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current">
          <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-red-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-orange-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 mb-10 relative z-10">
        <div className="text-center mb-32 mt-4 md:mt-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-6"
          >
            Pahlawan <span className="text-primary">Kebaikan</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Apresiasi untuk mereka yang paling aktif berbagi ketenangan dan dukungan di komunitas.
          </motion.p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white/85 border border-gray-100 rounded-3xl p-6 animate-pulse">
                <div className="w-20 h-20 mx-auto mt-2 mb-4 rounded-2xl bg-gray-100" />
                <div className="h-6 bg-gray-100 rounded w-2/3 mx-auto mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-3" />
                <div className="h-8 bg-gray-100 rounded-full w-24 mx-auto" />
              </div>
            ))}
          </div>
        ) : featuredMembers.length === 0 ? (
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Leaderboard belum memiliki data</p>
            <p className="text-sm text-gray-500">
              Belum ada member yang masuk ranking saat ini. Aktivitas komunitas berikutnya akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12">
            {featuredMembers.map((member, index) => (
              <motion.div
                key={`${member.user_id ?? "anonymous"}-${member.rank ?? index}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/85 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300"
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
          <Link href={ROUTES.LEADERBOARD} className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            <span>Lihat Hall of Fame</span>
            <User size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
