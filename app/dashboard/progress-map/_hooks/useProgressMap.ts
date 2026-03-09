"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { progressMapService } from "@/services/api/progress-map";
import type { FullMapResponse, MapRegion } from "@/types/progress-map";
import { toast } from "sonner";

export function useProgressMap() {
  const { token } = useAuthStore();
  const [mapData, setMapData] = useState<FullMapResponse | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingLandmark, setClaimingLandmark] = useState<string | null>(null);

  const fetchMap = useCallback(async () => {
    if (!token) return;
    try {
      const response = await progressMapService.getFullMap(token);
      setMapData(response.data);
    } catch {
      toast.error("Gagal memuat peta progress");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMap();
  }, [fetchMap]);

  const handleSelectRegion = useCallback((region: MapRegion) => {
    setSelectedRegion(region);
  }, []);

  const handleCloseRegion = useCallback(() => {
    setSelectedRegion(null);
  }, []);

  const handleClaimReward = useCallback(
    async (landmarkId: string) => {
      if (!token || claimingLandmark) return;
      setClaimingLandmark(landmarkId);
      try {
        await progressMapService.claimLandmarkReward(token, landmarkId);
        toast.success("Reward berhasil diklaim!");
        await fetchMap();
        // Update selected region if open
        if (selectedRegion) {
          const updated = mapData?.regions.find(
            (r) => r.region_key === selectedRegion.region_key
          );
          if (updated) setSelectedRegion(updated);
        }
      } catch {
        toast.error("Gagal mengklaim reward");
      } finally {
        setClaimingLandmark(null);
      }
    },
    [token, claimingLandmark, fetchMap, selectedRegion, mapData]
  );

  return {
    mapData,
    selectedRegion,
    loading,
    claimingLandmark,
    handleSelectRegion,
    handleCloseRegion,
    handleClaimReward,
  };
}
