"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import Link from "next/link";
import { Trophy, Medal, User } from "lucide-react";
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

  if (loading) return null;
  if (!users.length) return null;

  const topThree = users.slice(0, 3);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 items-end">
          {/* Second Place */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center relative order-2 md:order-1 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300"
            >
              <div className="absolute -top-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-600 rounded-full border-4 border-white shadow-md">
                  <Medal size={24} />
                </div>
              </div>

              <div className="w-20 h-20 mt-6 bg-linear-to-br from-gray-200 to-gray-400 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                {topThree[1].name.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                {topThree[1].name}
              </h3>
              <p className="text-gray-500 font-medium mb-2">{topThree[1].role || topThree[1].badge_name}</p>

              <div className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">
                {topThree[1].exp.toLocaleString()} EXP
              </div>
            </motion.div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-primary/10 rounded-3xl p-8 flex flex-col items-center relative transform md:-translate-y-12 order-1 md:order-2 shadow-2xl shadow-primary/10 z-10"
            >
              <div className="absolute -top-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 rounded-full"></div>
                  <Trophy size={64} className="text-yellow-400 relative z-10 drop-shadow-sm" />
                </div>
              </div>

              <div className="w-28 h-28 mt-8 bg-linear-to-br from-primary to-red-600 rounded-2xl mb-5 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary/20 overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                {topThree[0].name.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                {topThree[0].name}
              </h3>
              <p className="text-primary font-medium mb-3">{topThree[0].role || topThree[0].badge_name}</p>

              <div className="bg-linear-to-r from-primary to-red-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg shadow-primary/20">
                {topThree[0].exp.toLocaleString()} EXP
              </div>

              <div className="absolute top-4 right-4 animate-pulse">
                <span className="text-yellow-400">✨</span>
              </div>
              <div className="absolute bottom-10 left-4 animate-pulse delay-700">
                <span className="text-yellow-400">✨</span>
              </div>
            </motion.div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center relative order-3 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300"
            >
              <div className="absolute -top-6">
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-700 rounded-full border-4 border-white shadow-md">
                  <Medal size={24} />
                </div>
              </div>

              <div className="w-20 h-20 mt-6 bg-linear-to-br from-amber-600 to-amber-800 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                {topThree[2].name.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                {topThree[2].name}
              </h3>
              <p className="text-gray-500 font-medium mb-2">{topThree[2].role || topThree[2].badge_name}</p>

              <div className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">
                {topThree[2].exp.toLocaleString()} EXP
              </div>
            </motion.div>
          )}
        </div>

        <div className="text-center">
          <Link href="/leaderboard" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            <span>Lihat Semua Peringkat</span>
            <User size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
