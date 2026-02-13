"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import { SongCategory } from "@/types";
import { cn } from "@/lib/utils";

interface MusicCategoryCardProps {
  category: SongCategory;
  onClick: () => void;
  isExpanded?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

const categoryGradients: Record<string, { from: string; to: string }> = {
  relaksasi: { from: "from-sky-300", to: "to-sky-500" },
  meditasi: { from: "from-violet-300", to: "to-violet-500" },
  fokus: { from: "from-emerald-300", to: "to-emerald-500" },
  tidur: { from: "from-indigo-300", to: "to-indigo-500" },
  alam: { from: "from-teal-300", to: "to-teal-500" },
  default: { from: "from-rose-300", to: "to-rose-500" },
};

export function MusicCategoryCard({
  category,
  onClick,
  isExpanded,
}: MusicCategoryCardProps) {
  const gradient = categoryGradients[category.name.toLowerCase()] || categoryGradients.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer group",
        "aspect-[4/3] md:aspect-[3/2]",
        isExpanded && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onClick}
    >
      {/* Background Image or Gradient */}
      {category.thumbnail ? (
        <>
          <Image
            src={category.thumbnail}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </>
      ) : (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          gradient.from,
          gradient.to
        )} />
      )}

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-1">
          <Music className="w-4 h-4 text-white/80" />
          <span className="text-xs font-medium text-white/80">
            {category.song_count || 0} Lagu
          </span>
        </div>
        <h3 className="text-xl font-bold text-white drop-shadow-lg">
          {category.name}
        </h3>
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 text-primary fill-primary ml-1" />
        </div>
      </div>
    </motion.div>
  );
}
