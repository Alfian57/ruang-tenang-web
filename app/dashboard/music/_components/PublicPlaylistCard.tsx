"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, ListMusic, BadgeCheck, Globe, User } from "lucide-react";
import { PlaylistListItem } from "@/types";
import { cn } from "@/utils";

interface PublicPlaylistCardProps {
  playlist: PlaylistListItem;
  onClick?: () => void;
  onPlay?: () => void;
}

export function PublicPlaylistCard({
  playlist,
  onClick,
  onPlay,
}: PublicPlaylistCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden",
        "border border-gray-100",
        "hover:shadow-md transition-all duration-300",
        "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square">
        {playlist.thumbnail ? (
          <Image
            src={playlist.thumbnail}
            alt={playlist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <ListMusic className="w-16 h-16 text-purple-400" />
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200"
          >
            <Play className="w-6 h-6 fill-white ml-1" />
          </button>
        </div>

        {/* Admin Badge */}
        {playlist.is_admin_playlist && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-xs font-medium shadow-lg">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Ruang Tenang</span>
            </div>
          </div>
        )}

        {/* Song Count Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            {playlist.item_count} lagu
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {playlist.name}
        </h3>
        
        {playlist.description ? (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {playlist.description}
          </p>
        ) : (
          <div className="mb-3" />
        )}

        {/* Author Info */}
        {playlist.user && !playlist.is_admin_playlist && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {playlist.user.avatar ? (
              <Image
                src={playlist.user.avatar}
                alt={playlist.user.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
            )}
            <span>oleh {playlist.user.name}</span>
          </div>
        )}

        {playlist.is_admin_playlist && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Globe className="w-3.5 h-3.5" />
            <span>Playlist Resmi</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Horizontal variant for featured section
interface PublicPlaylistCardHorizontalProps {
  playlist: PlaylistListItem;
  onClick?: () => void;
  onPlay?: () => void;
}

export function PublicPlaylistCardHorizontal({
  playlist,
  onClick,
  onPlay,
}: PublicPlaylistCardHorizontalProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group flex gap-4 p-3 rounded-xl",
        "bg-white border border-gray-100",
        "hover:shadow-lg transition-all cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
        {playlist.thumbnail ? (
          <Image
            src={playlist.thumbnail}
            alt={playlist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <ListMusic className="w-8 h-8 text-purple-400" />
          </div>
        )}

        {/* Play Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
          className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="w-8 h-8 text-white fill-white" />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {playlist.name}
          </h3>
          {playlist.is_admin_playlist && (
            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">
          {playlist.item_count} lagu
          {playlist.user && !playlist.is_admin_playlist && ` • ${playlist.user.name}`}
        </p>
      </div>
    </motion.div>
  );
}
