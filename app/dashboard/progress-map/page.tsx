"use client";

import { motion } from "framer-motion";
import { MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressMap } from "./_hooks/useProgressMap";
import {
    WorldMap,
    RegionDetailPanel,
    ProgressOverview,
} from "./_components";

function MapSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-16 rounded-xl" />
            <div className="space-y-6 max-w-4xl mx-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                        <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shrink-0" />
                        <Skeleton className="flex-1 h-24 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProgressMapPage() {
    const {
        mapData,
        selectedRegion,
        loading,
        claimingLandmark,
        handleSelectRegion,
        handleCloseRegion,
        handleClaimReward,
    } = useProgressMap();

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <MapIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Peta Perjalanan
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base">
                            Jelajahi dan buka kunci area baru seiring perjalananmu.
                        </p>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <MapSkeleton />
            ) : mapData ? (
                <>
                    <ProgressOverview mapData={mapData} />
                    <WorldMap mapData={mapData} onSelectRegion={handleSelectRegion} />

                    {selectedRegion && (
                        <RegionDetailPanel
                            region={selectedRegion}
                            onClose={handleCloseRegion}
                            onClaimReward={handleClaimReward}
                            claimingLandmark={claimingLandmark}
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-16 text-gray-400">
                    <MapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gagal memuat peta. Silakan coba lagi.</p>
                </div>
            )}
        </div>
    );
}
