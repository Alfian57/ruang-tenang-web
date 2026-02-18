"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { songService } from "@/services/api";
import { Song, SongCategory } from "@/types";
import { CategoryClient } from "./CategoryClient";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Music } from "lucide-react";

import { ROUTES } from "@/lib/routes";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [category, setCategory] = useState<SongCategory | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      setError("");

      try {
        // Fetch categories to find the current one (since API doesn't have getCategoryById)
        const categoriesRes = await songService.getCategories() as { data: SongCategory[] };
        const foundCategory = categoriesRes.data?.find((c) => c.id === Number(id));

        if (!foundCategory) {
          setError("Kategori tidak ditemukan");
          setIsLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Fetch songs for this category
        const songsRes = await songService.getSongsByCategory(Number(id)) as { data: Song[] };
        setSongs(songsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch category details:", err);
        setError("Gagal memuat detail kategori");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<Music className="w-12 h-12 text-gray-300" />}
          title="Kategori Tidak Ditemukan"
          description={error || "Kategori yang kamu cari tidak tersedia"}
          action={{
            label: "Kembali ke Musik",
            onClick: () => router.push(ROUTES.MUSIC),
          }}
        />
      </div>
    );
  }

  return <CategoryClient category={category} songs={songs} />;
}
