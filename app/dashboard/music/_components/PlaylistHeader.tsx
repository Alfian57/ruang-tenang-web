"use client";

import { useState } from "react";

import Image from "next/image";
import { ArrowLeft, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playlist } from "@/types";

interface PlaylistHeaderProps {
    playlist: Playlist;
    onBack: () => void;
    itemCount: number;
}

export function PlaylistHeader({
    playlist,
    onBack,
    itemCount,
}: PlaylistHeaderProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={onBack}
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="w-20 h-20 rounded-xl overflow-hidden bg-linear-to-br from-purple-100 to-purple-200 shrink-0">
                {playlist.thumbnail && !imgError ? (
                    <Image
                        src={playlist.thumbnail}
                        alt={playlist.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50">
                        <ListMusic className="w-8 h-8 text-purple-300" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                    {playlist.name}
                </h2>
                {playlist.description && (
                    <p className="text-sm text-gray-500 truncate">
                        {playlist.description}
                    </p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                    {itemCount} lagu
                </p>
            </div>
        </div>
    );
}
