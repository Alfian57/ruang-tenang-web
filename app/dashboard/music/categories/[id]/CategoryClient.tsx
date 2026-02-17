"use client";

import { CategoryDetailView } from "../../_components/CategoryDetailView";
import { Song, SongCategory } from "@/types";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface CategoryClientProps {
  category: SongCategory;
  songs: Song[];
}

export function CategoryClient({ category, songs }: CategoryClientProps) {
  const router = useRouter();
  const { currentSong, isPlaying, playSong, setIsPlaying } = useMusicPlayerStore();

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      playSong(song, songs, { type: "category", name: category.name });
    }
  };

  return (
    <CategoryDetailView
      category={category}
      songs={songs}
      onBack={() => router.push(ROUTES.MUSIC)}
      currentSong={currentSong || null}
      isPlaying={isPlaying}
      onPlay={handlePlaySong}
    />
  );
}
