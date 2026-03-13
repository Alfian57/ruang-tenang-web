"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { Navbar, Footer } from "@/components/layout";
import { Users } from "lucide-react";
import { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(50);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await communityService.getLeaderboard(limit);
        setUsers(response.data || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  const featuredMembers = users.slice(0, 3);
  const otherMembers = users.slice(3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="back" />

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-red-100/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-20 left-0 w-100 h-100 bg-orange-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
          >
            Hall of <span className="text-primary">Fame</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Lihat siapa yang paling berkontribusi dalam membangun komunitas yang positif.
          </motion.p>
        </div>

        {loading ? (
          <div className="space-y-8">
            {/* Podium skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-end">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`bg-white rounded-3xl p-6 flex flex-col items-center space-y-4 ${i === 2 ? "md:-translate-y-8" : ""}`}>
                  <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                  <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
            {/* List skeleton */}
            <div className="bg-white rounded-3xl border overflow-hidden max-w-4xl mx-auto">
              <div className="p-6 border-b bg-gray-50/50">
                <div className="h-6 w-36 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="divide-y">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 md:p-6 flex items-center gap-4">
                    <div className="w-8 h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                    </div>
                    <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Members */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
              {featuredMembers.map((member, index) => (
                <motion.div
                  key={member.user_id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/85 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-lg shadow-gray-200/50"
                >
                  <div className="w-20 h-20 mt-2 bg-linear-to-br from-primary/80 to-red-600 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                    {member.name}
                  </h3>
                  <p className="text-gray-500 font-medium mb-3">{member.role || member.badge_name}</p>

                  <div className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">
                    {member.exp.toLocaleString()} EXP
                  </div>
                </motion.div>
              ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden max-w-4xl mx-auto">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Daftar Hall of Fame</h3>
              </div>

              <div className="divide-y divide-gray-100">
                {otherMembers.map((user, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.user_id}
                    className="p-4 md:p-6 flex items-center hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-primary mr-4 md:mr-6 group-hover:bg-primary/10 transition-colors">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="font-bold text-gray-800 truncate">{user.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{user.role || user.badge_name}</p>
                    </div>

                    <div className="font-bold text-gray-800 text-right whitespace-nowrap">
                      {user.exp.toLocaleString()} <span className="text-primary text-sm font-medium">EXP</span>
                    </div>
                  </motion.div>
                ))}

                {otherMembers.length === 0 && (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Tidak ada pengguna lain</h3>
                    <p className="text-gray-400 text-sm mt-1">Pengguna lain akan muncul di sini</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
