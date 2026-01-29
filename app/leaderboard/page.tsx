"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Navbar, Footer } from "@/components/landing";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardUser {
  id: number;
  name: string;
  exp: number;
  role: string;
}

interface LeaderboardResponse {
  data: LeaderboardUser[];
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(50);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.getLeaderboard(limit) as LeaderboardResponse;
        setUsers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);

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
            Papan <span className="text-primary">Peringkat</span>
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
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
           </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20 items-end">
              {/* Second Place */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center relative order-2 md:order-1 shadow-lg shadow-gray-200/50"
                >
                  <div className="absolute -top-5">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full border-4 border-white shadow-md">
                      <Medal size={20} />
                    </div>
                  </div>

                  <div className="w-20 h-20 mt-4 bg-linear-to-br from-gray-200 to-gray-400 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {topThree[1].name.charAt(0).toUpperCase()}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                    {topThree[1].name}
                  </h3>
                  <p className="text-gray-500 font-medium mb-3">{topThree[1].role}</p>
                  
                  <div className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">
                    {topThree[1].exp.toLocaleString()} EXP
                  </div>
                </motion.div>
              )}

              {/* First Place */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-primary/10 rounded-3xl p-8 flex flex-col items-center relative transform md:-translate-y-8 order-1 md:order-2 shadow-2xl shadow-primary/10 z-10"
                >
                  <div className="absolute -top-10">
                     <div className="relative">
                       <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 rounded-full"></div>
                       <Trophy size={56} className="text-yellow-400 relative z-10 drop-shadow-sm" />
                     </div>
                  </div>
                  
                  <div className="w-28 h-28 mt-6 bg-linear-to-br from-primary to-red-600 rounded-2xl mb-5 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary/20 overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    {topThree[0].name.charAt(0).toUpperCase()}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                    {topThree[0].name}
                  </h3>
                  <p className="text-primary font-medium mb-4">{topThree[0].role}</p>
                  
                  <div className="bg-linear-to-r from-primary to-red-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg shadow-primary/20">
                    {topThree[0].exp.toLocaleString()} EXP
                  </div>
                  
                  <div className="absolute top-4 right-4 animate-pulse">
                    <span className="text-yellow-400">✨</span>
                  </div>
                </motion.div>
              )}

              {/* Third Place */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 flex flex-col items-center relative order-3 shadow-lg shadow-gray-200/50"
                >
                  <div className="absolute -top-5">
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-700 rounded-full border-4 border-white shadow-md">
                      <Medal size={20} />
                    </div>
                  </div>

                  <div className="w-20 h-20 mt-4 bg-linear-to-br from-amber-600 to-amber-800 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {topThree[2].name.charAt(0).toUpperCase()}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-4 w-full">
                    {topThree[2].name}
                  </h3>
                  <p className="text-gray-500 font-medium mb-3">{topThree[2].role}</p>
                  
                  <div className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm">
                    {topThree[2].exp.toLocaleString()} EXP
                  </div>
                </motion.div>
              )}
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden max-w-4xl mx-auto">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-800">Semua Peringkat</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {restUsers.map((user, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.id} 
                    className="p-4 md:p-6 flex items-center hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 text-center font-bold text-gray-400 group-hover:text-primary transition-colors">
                      #{index + 4}
                    </div>
                    
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-primary mr-4 md:mr-6 group-hover:bg-primary/10 transition-colors">
                       {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="font-bold text-gray-800 truncate">{user.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                    </div>
                    
                    <div className="font-bold text-gray-800 text-right whitespace-nowrap">
                      {user.exp.toLocaleString()} <span className="text-primary text-sm font-medium">EXP</span>
                    </div>
                  </motion.div>
                ))}
                
                {restUsers.length === 0 && (
                   <div className="p-12 text-center text-gray-500">
                      Tidak ada pengguna lain untuk ditampilkan.
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
