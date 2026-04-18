"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ListMusic,
  Library,
  Compass,
  PenLine,
  Wind,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  PlaylistDialog,
  BrowseTab,
  ExploreTab,
  PlaylistsTab
} from "./_components";
import { useMusic } from "./_hooks/useMusic";
import { useRouter } from "next/navigation";
import type { MusicJourneyCard } from "./_components/ExploreTab";
import { ROUTES } from "@/lib/routes";

const MUSIC_JOURNEYS: MusicJourneyCard[] = [
  {
    id: "calm-overthinking",
    title: "Redakan Overthinking",
    situation: "Untuk kepala yang terlalu ramai menjelang malam.",
    direction: "Turun dari tegang -> tenang -> fokus napas.",
    duration: "8-12 menit",
    categoryKeywords: ["calm", "tenang", "sleep", "malam", "ambient"],
    fallbackSearch: "relax",
    nextActionLabel: "Tulis brain dump 3 menit",
    nextActionHref: "/dashboard/journal/create?mode=brain-dump",
  },
  {
    id: "focus-reset",
    title: "Reset Fokus Belajar",
    situation: "Saat mulai buyar, tapi tetap mau lanjut progres.",
    direction: "Dari terdistraksi -> stabil -> kembali ke prioritas.",
    duration: "10-15 menit",
    categoryKeywords: ["focus", "study", "lofi", "instrumental"],
    fallbackSearch: "focus",
    nextActionLabel: "Susun rencana pemulihan 24 jam",
    nextActionHref: "/dashboard/journal/create?mode=action-plan",
  },
  {
    id: "gentle-mood-lift",
    title: "Naikkan Energi Pelan",
    situation: "Saat mood turun dan butuh dorongan kecil yang aman.",
    direction: "Dari lesu -> hangat -> siap bergerak pelan.",
    duration: "6-10 menit",
    categoryKeywords: ["happy", "uplift", "hope", "sunrise", "positive"],
    fallbackSearch: "uplift",
    nextActionLabel: "Lanjut refleksi dengan Teman Cerita AI",
    nextActionHref: ROUTES.CHAT,
  },
];

const JOURNEY_CONTEXT_BY_ID: Record<string, string> = {
  "calm-overthinking": "calm-overthinking",
  "focus-reset": "focus-reset",
  "gentle-mood-lift": "gentle-mood-lift",
};

const DEFAULT_REFLECTION_JOURNEY_ID = "focus-reset";

function withQuery(href: string, params: Record<string, string>): string {
  const [path, rawQuery = ""] = href.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export default function MusicPage() {
  const router = useRouter(); // Helper to navigate
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const {
    // State
    activeTab,
    search,
    categories,
    songs,
    isLoading,
    playlists,
    publicPlaylists,
    adminPlaylists,
    isPlaylistDialogOpen,
    editingPlaylist,
    playlistsLoading,
    publicPlaylistsLoading,
    isSaving,
    showDeletePlaylistDialog,
    isDeleting,
    debouncedSearch,

    // Actions - Setters
    setActiveTab,
    setSearch,
    setIsPlaylistDialogOpen,
    setEditingPlaylist,
    setShowDeletePlaylistDialog,
    setDeletePlaylistId,

    // Actions - Handlers
    handlePlaySong,
    handlePlaylistEdit,
    handlePlaylistDeleteClick,
    handlePlaylistDelete,
    handlePlaylistSave,

    // Player State
    currentSong,
    isPlaying,
  } = useMusic();

  const handleJourneyStart = (journey: MusicJourneyCard) => {
    setActiveJourneyId(journey.id);
    setActiveTab("browse");

    const matchedCategory = categories.find((category) => {
      const normalizedName = category.name.toLowerCase();
      const normalizedSlug = category.slug?.toLowerCase() || "";
      return journey.categoryKeywords.some((keyword) =>
        normalizedName.includes(keyword) || normalizedSlug.includes(keyword)
      );
    });

    if (matchedCategory) {
      router.push(`/dashboard/music/categories/${matchedCategory.slug || matchedCategory.id}?journey=${journey.id}`);
      return;
    }

    setSearch(journey.fallbackSearch);
  };

  const suggestedJourney = currentSong
    ? MUSIC_JOURNEYS.find((journey) =>
      journey.categoryKeywords.some((keyword) =>
        (currentSong.category?.name || "").toLowerCase().includes(keyword)
      )
    )
    : null;

  const activeJourney = useMemo(() => {
    if (suggestedJourney) return suggestedJourney;
    if (!activeJourneyId) return null;
    return MUSIC_JOURNEYS.find((journey) => journey.id === activeJourneyId) || null;
  }, [activeJourneyId, suggestedJourney]);

  const reflectionJourney = activeJourney
    || suggestedJourney
    || MUSIC_JOURNEYS.find((journey) => journey.id === DEFAULT_REFLECTION_JOURNEY_ID)
    || MUSIC_JOURNEYS[0];

  const resolveJourneyNextActionHref = (journey: MusicJourneyCard) => {
    const context = JOURNEY_CONTEXT_BY_ID[journey.id] || journey.id;
    const params: Record<string, string> = {
      source: "music",
      journey: journey.id,
      context,
      journeyTitle: journey.title,
      journeyDirection: journey.direction,
      nextAction: journey.nextActionLabel,
    };

    if (currentSong?.id) {
      params.track = String(currentSong.id);
    }

    if (currentSong?.title) {
      params.trackTitle = currentSong.title;
    }

    if (currentSong?.category?.name) {
      params.trackCategory = currentSong.category.name;
    }

    return withQuery(journey.nextActionHref, params);
  };

  const resolveMusicReflectionHref = (journey: MusicJourneyCard) => {
    const context = JOURNEY_CONTEXT_BY_ID[journey.id] || journey.id;
    const params: Record<string, string> = {
      source: "music",
      journey: journey.id,
      context,
      journeyTitle: journey.title,
      journeyDirection: journey.direction,
      nextAction: journey.nextActionLabel,
    };

    if (currentSong?.id) {
      params.track = String(currentSong.id);
    }

    if (currentSong?.title) {
      params.trackTitle = currentSong.title;
    }

    if (currentSong?.category?.name) {
      params.trackCategory = currentSong.category.name;
    }

    return withQuery("/dashboard/journal/create?mode=structured-reflection", params);
  };

  // Navigation handlers
  const navigateToPlaylist = (playlist: { id?: number; slug?: string; uuid?: string }) => {
    const identifier = playlist.slug || playlist.uuid || playlist.id;
    if (!identifier) return;
    router.push(`/dashboard/music/playlist/${identifier}`);
  };

  return (
    <>
      {/* Delete Playlist Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeletePlaylistDialog}
        onClose={() => {
          setShowDeletePlaylistDialog(false);
          setDeletePlaylistId(null);
        }}
        onConfirm={handlePlaylistDelete}
        title="Hapus Playlist"
        description="Apakah kamu yakin ingin menghapus playlist ini? Semua lagu dalam playlist akan dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="p-4 lg:p-6 pb-32 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Musik Relaksasi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Biarkan musik menenangkan harimu
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-sky-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">MUSIC-2</p>
              <h2 className="text-lg font-semibold text-gray-900 mt-1">
                {currentSong
                  ? `Setelah mendengar "${currentSong.title}", lanjutkan aksi kecil.`
                  : "Ubah sesi dengar jadi langkah pemulihan yang nyata."}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {suggestedJourney
                  ? `Rekomendasi berikutnya: ${suggestedJourney.nextActionLabel}.`
                  : "Pilih journey lalu tutup dengan refleksi singkat, atur napas, atau obrolan suportif."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="bg-white">
                <Link href={resolveMusicReflectionHref(reflectionJourney)} className="inline-flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5" />
                  Refleksi 3 Menit
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="bg-white">
                <Link href={ROUTES.BREATHING} className="inline-flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" />
                  Atur Napas
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={ROUTES.CHAT} className="inline-flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Teman Cerita AI
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {activeJourney && (
          <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Journey Recap</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">{activeJourney.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentSong
                ? `Kamu sedang berada di fase "${activeJourney.direction}" dengan lagu ${currentSong.title}.`
                : `Arah sesi: ${activeJourney.direction}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-1.5">
                <Link href={resolveJourneyNextActionHref(activeJourney)}>
                  {activeJourney.nextActionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="bg-white" onClick={() => handleJourneyStart(activeJourney)}>
                Ulang Journey
              </Button>
            </div>
          </section>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
          <TabsList className="mb-6 w-full max-w-full overflow-x-auto">
            <TabsTrigger value="browse" className="text-xs sm:text-sm shrink-0">
              <Library className="w-4 h-4 mr-1.5" />
              Jelajahi
            </TabsTrigger>
            <TabsTrigger value="explore" className="text-xs sm:text-sm shrink-0">
              <Compass className="w-4 h-4 mr-1.5" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="playlists" className="text-xs sm:text-sm shrink-0">
              <ListMusic className="w-4 h-4 mr-1.5" />
              Playlist
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab - Categories */}
          <TabsContent value="browse" className="min-w-0 overflow-x-hidden">
            <BrowseTab
              search={search}
              setSearch={setSearch}
              isLoading={isLoading}
              debouncedSearch={debouncedSearch}
              songs={songs}
              categories={categories}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlay={handlePlaySong}
              onCategoryClick={(category) => router.push(`/dashboard/music/categories/${category.slug || category.id}`)}
            />
          </TabsContent>

          {/* Explore Tab - Public Playlists */}
          <TabsContent value="explore" className="min-w-0 overflow-x-hidden">
            <ExploreTab
              isLoading={publicPlaylistsLoading}
              adminPlaylists={adminPlaylists}
              publicPlaylists={publicPlaylists}
              onPlaylistClick={navigateToPlaylist}
              journeys={MUSIC_JOURNEYS}
              onJourneyStart={handleJourneyStart}
            />
          </TabsContent>

          {/* My Playlists Tab */}
          <TabsContent value="playlists" className="min-w-0 overflow-x-hidden">
            <PlaylistsTab
              isLoading={playlistsLoading}
              playlists={playlists}
              onCreateClick={() => {
                setEditingPlaylist(null);
                setIsPlaylistDialogOpen(true);
              }}
              onPlaylistClick={navigateToPlaylist}
              onEditClick={handlePlaylistEdit}
              onDeleteClick={handlePlaylistDeleteClick}
            />
          </TabsContent>
        </Tabs>

        {/* Playlist Dialog */}
        <PlaylistDialog
          open={isPlaylistDialogOpen}
          onOpenChange={(open) => {
            setIsPlaylistDialogOpen(open);
            if (!open) setEditingPlaylist(null);
          }}
          playlist={editingPlaylist}
          onSave={handlePlaylistSave}
          isLoading={isSaving}
        />
      </div>
    </>
  );
}
