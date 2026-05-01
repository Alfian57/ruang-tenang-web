"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { progressMapService } from "@/services/api/progress-map";
import type { FullMapResponse, MapRegion } from "@/types/progress-map";
import { toast } from "sonner";

export function useProgressMap() {
  const { token, refreshUser } = useAuthStore();
  const [mapData, setMapData] = useState<FullMapResponse | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingLandmark, setClaimingLandmark] = useState<string | null>(null);
  const selectedRegionKey = selectedRegion?.region_key;

  const fetchMap = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await progressMapService.getFullMap(token);
      setMapData(response.data);
      return response.data;
    } catch {
      toast.error("Gagal memuat peta progress");
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMap();
  }, [fetchMap]);

  useEffect(() => {
    if (!selectedRegionKey || !mapData) return;

    const updatedRegion = mapData.regions.find(
      (r) => r.region_key === selectedRegionKey
    );

    if (updatedRegion) {
      setSelectedRegion(updatedRegion);
    }
  }, [mapData, selectedRegionKey]);

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
        const freshMap = await fetchMap();
        await refreshUser();
        // Update selected region if open
        if (selectedRegion && freshMap) {
          const updated = freshMap.regions.find(
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
    [token, claimingLandmark, fetchMap, selectedRegion, refreshUser]
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
