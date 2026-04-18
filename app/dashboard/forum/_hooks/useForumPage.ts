"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { forumService } from "@/services/api";
import { Forum, ForumCategory } from "@/types/forum";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { toast } from "sonner";
import { ApiError } from "@/services/http/types";

export type ForumPostFormat =
  | "curhat"
  | "minta_saran"
  | "cari_teman"
  | "victory_note"
  | "confession";

export type ForumSupportCircle =
  | "tekanan_akademik"
  | "relasi_pertemanan"
  | "regulasi_emosi"
  | "pemulihan_burnout";

export const FORUM_POST_FORMAT_LABELS: Record<ForumPostFormat, string> = {
  curhat: "Curhat",
  minta_saran: "Minta Saran",
  cari_teman: "Cari Teman Seperjuangan",
  victory_note: "Victory Note",
  confession: "Confessional Writing",
};

export interface ForumSupportCircleOption {
  id: ForumSupportCircle;
  title: string;
  description: string;
  defaultFormat: ForumPostFormat;
  starterTitle: string;
  starterContent: string;
  keywords: string[];
}

export const FORUM_SUPPORT_CIRCLES: ForumSupportCircleOption[] = [
  {
    id: "tekanan_akademik",
    title: "Tekanan Akademik",
    description: "Tugas, skripsi, ujian, dan ritme kuliah yang bikin kewalahan.",
    defaultFormat: "minta_saran",
    starterTitle: "Butuh strategi realistis untuk menghadapi tekanan akademik minggu ini",
    starterContent:
      "Aku lagi merasa kewalahan dengan tekanan akademik. Aku ingin minta saran yang praktis dan realistis untuk 1 minggu ke depan.",
    keywords: ["akademik", "kuliah", "skripsi", "ujian", "tugas", "deadline", "ospek"],
  },
  {
    id: "relasi_pertemanan",
    title: "Relasi & Pertemanan",
    description: "Konflik, batas sehat, dan rasa kesepian dalam pertemanan.",
    defaultFormat: "cari_teman",
    starterTitle: "Lagi butuh teman ngobrol soal relasi yang lagi berat",
    starterContent:
      "Akhir-akhir ini relasiku terasa berat dan aku lagi belajar pasang batas yang sehat. Kalau ada yang pernah mengalami hal serupa, boleh cerita juga.",
    keywords: ["teman", "relasi", "hubungan", "konflik", "kesepian", "komunikasi", "toxic"],
  },
  {
    id: "regulasi_emosi",
    title: "Regulasi Emosi",
    description: "Overthinking, cemas, marah, atau sedih yang sulit dikelola.",
    defaultFormat: "curhat",
    starterTitle: "Overthinking lagi tinggi, mau belajar regulasi emosi pelan-pelan",
    starterContent:
      "Belakangan ini emosiku naik turun dan overthinking cukup berat. Aku mau cerita sambil cari cara kecil biar lebih tenang.",
    keywords: ["cemas", "overthinking", "panik", "emosi", "marah", "sedih", "stress"],
  },
  {
    id: "pemulihan_burnout",
    title: "Pemulihan Burnout",
    description: "Pemulihan energi setelah kelelahan mental dan kehilangan motivasi.",
    defaultFormat: "victory_note",
    starterTitle: "Mau merayakan langkah kecil keluar dari burnout",
    starterContent:
      "Aku lagi proses pulih dari burnout. Hari ini ada satu langkah kecil yang berhasil kulakukan, dan aku ingin mencatatnya sebagai pengingat.",
    keywords: ["burnout", "lelah", "capek", "motivasi", "pemulihan", "istirahat", "recover"],
  },
];

export function useForumPage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useAuthStore();
  const isBlocked = useBlockStore((s) => s.isBlocked);
  const isForumBlocked = Boolean(user?.is_forum_blocked);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | undefined>(undefined);
  const [newPostFormat, setNewPostFormat] = useState<ForumPostFormat>("curhat");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Read from URL
  const urlSearch = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : undefined;
  const selectedSupportCircle = (() => {
    const raw = searchParams.get("circle");
    if (!raw) return undefined;
    return FORUM_SUPPORT_CIRCLES.some((circle) => circle.id === raw)
      ? (raw as ForumSupportCircle)
      : undefined;
  })();

  // Local state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync state from URL
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrlParam("search", debouncedSearch || null);
    }
  }, [debouncedSearch, updateUrlParam, urlSearch]);

  const setSearch = (value: string) => setSearchTerm(value);
  const setSelectedCategory = (id: number | undefined) => updateUrlParam("category", id ? String(id) : null);
  const setSelectedSupportCircle = (id: ForumSupportCircle | undefined) => {
    updateUrlParam("circle", id || null);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [forumsRes, categoriesRes] = await Promise.all([
        forumService.getAll(token, 20, 0, debouncedSearch, selectedCategory),
        forumService.getCategories()
      ]);
      setForums(forumsRes.data);
      const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes;
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Gagal memuat data forum");
    } finally {
      setIsLoading(false);
    }
  }, [token, debouncedSearch, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateForum = async () => {
    if (!newTitle.trim() || !token) return;

    if (isForumBlocked) {
      toast.error("Akses forum kamu sedang diblokir oleh admin");
      return;
    }

    setIsSubmitting(true);
    try {
      const formatLabel = FORUM_POST_FORMAT_LABELS[newPostFormat];
      const normalizedContent = newContent.trim();
      const contentWithFormat = normalizedContent
        ? `[Format: ${formatLabel}]\n\n${normalizedContent}`
        : `[Format: ${formatLabel}]`;

      const response = await forumService.create(token, {
        title: newTitle,
        content: contentWithFormat,
        category_id: newCategoryId,
      });

      setIsCreateOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategoryId(undefined);
      setNewPostFormat("curhat");

      toast.success("Topik berhasil dibuat, mengalihkan...");

      if (response.data && response.data.slug) {
        router.push(`/dashboard/forum/${response.data.slug}`);
      } else {
        loadData();
      }
    } catch (error) {
      console.error("Failed to create forum:", error);
      if (error instanceof ApiError && error.status === 403) {
        toast.error(error.message || "Akses forum kamu sedang diblokir oleh admin");
      } else {
        toast.error("Gagal membuat topik");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCircleConfig = selectedSupportCircle
    ? FORUM_SUPPORT_CIRCLES.find((circle) => circle.id === selectedSupportCircle)
    : undefined;

  const visibleForums = forums
    .filter((forum) => !isBlocked(forum.user_id))
    .filter((forum) => {
      if (!selectedCircleConfig) return true;

      const normalizedText = `${forum.title} ${forum.content} ${forum.category?.name ?? ""}`.toLowerCase();
      const hasKeywordMatch = selectedCircleConfig.keywords.some((keyword) => normalizedText.includes(keyword));
      const formatLabel = FORUM_POST_FORMAT_LABELS[selectedCircleConfig.defaultFormat].toLowerCase();
      const hasFormatTag = normalizedText.includes(`[format: ${formatLabel}]`);

      return hasKeywordMatch || hasFormatTag;
    });

  return {
    forums: visibleForums,
    categories,
    isLoading,
    search: searchTerm,
    selectedCategory,
    selectedSupportCircle,
    isCreateOpen,
    newTitle,
    newContent,
    newCategoryId,
    newPostFormat,
    isSubmitting,
    isForumBlocked,
    setSearch,
    setSelectedCategory,
    setSelectedSupportCircle,
    setIsCreateOpen,
    setNewTitle,
    setNewContent,
    setNewCategoryId,
    setNewPostFormat,
    handleCreateForum,
  };
}
