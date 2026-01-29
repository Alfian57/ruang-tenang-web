"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, Filter, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ExpHistory, ExpHistoryResponse, LevelConfig } from "@/types";

interface ExpHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  currentExp: number;
  currentLevel: number;
  badgeName: string;
  badgeIcon: string;
}

const ACTIVITY_LABELS: Record<string, string> = {
  chat_ai: "Chat AI",
  upload_article: "Upload Artikel",
  forum_comment: "Komentar Forum",
};

export function ExpHistoryModal({
  isOpen,
  onClose,
  token,
  currentExp,
  currentLevel,
  badgeName,
  badgeIcon,
}: ExpHistoryModalProps) {
  const [history, setHistory] = useState<ExpHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
  const [nextLevel, setNextLevel] = useState<LevelConfig | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getExpHistory(token, {
        activity_type: selectedActivityType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        limit: 10,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any;
      
      const data = response.data as ExpHistoryResponse;
      setHistory(data.data || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch EXP history:", error);
    } finally {
      setLoading(false);
    }
  }, [token, page, selectedActivityType, startDate, endDate]);

  const fetchActivityTypes = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.getExpHistoryActivityTypes(token) as any;
      setActivityTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch activity types:", error);
    }
  }, [token]);

  const fetchLevelConfigs = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.getLevelConfigs() as any;
      const configs = response.data as LevelConfig[];
      setLevelConfigs(configs);
      
      // Find next level
      const next = configs.find((c: LevelConfig) => c.level > currentLevel);
      setNextLevel(next || null);
    } catch (error) {
      console.error("Failed to fetch level configs:", error);
    }
  }, [currentLevel]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      fetchActivityTypes();
      fetchLevelConfigs();
    }
  }, [isOpen, fetchHistory, fetchActivityTypes, fetchLevelConfigs]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [page, selectedActivityType, startDate, endDate, isOpen, fetchHistory]);

  const handleClearFilters = () => {
    setSelectedActivityType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const progressToNextLevel = nextLevel 
    ? Math.min(100, ((currentExp - (levelConfigs.find(c => c.level === currentLevel)?.min_exp || 0)) / (nextLevel.min_exp - (levelConfigs.find(c => c.level === currentLevel)?.min_exp || 0))) * 100)
    : 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-linear-to-r from-yellow-400 to-amber-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-5xl">{badgeIcon}</div>
            <div>
              <h2 className="text-2xl font-bold">{badgeName}</h2>
              <p className="text-yellow-100">Level {currentLevel}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{currentExp} EXP</span>
              {nextLevel && <span>{nextLevel.min_exp} EXP</span>}
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
            {nextLevel ? (
              <p className="text-xs text-yellow-100 mt-1">
                {nextLevel.min_exp - currentExp} EXP lagi untuk mencapai {nextLevel.badge_name}
              </p>
            ) : (
              <p className="text-xs text-yellow-100 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Level maksimum tercapai!
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {/* Activity Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedActivityType}
                onChange={(e) => {
                  setSelectedActivityType(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Semua Aktivitas</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {ACTIVITY_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Dari"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Sampai"
              />
            </div>

            {(selectedActivityType || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada riwayat EXP</p>
              <p className="text-sm mt-1">Lakukan aktivitas untuk mendapatkan EXP!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-lg">
                        {item.activity_type === "chat_ai" && "💬"}
                        {item.activity_type === "upload_article" && "📝"}
                        {item.activity_type === "forum_comment" && "💭"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-linear-to-r from-yellow-400 to-amber-500 text-white">
                      +{item.points} EXP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Menampilkan {history.length} dari {total} riwayat
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
