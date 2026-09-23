"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Trophy, Users } from "lucide-react";
import { communityService } from "@/services/api/community";
import { storyService } from "@/services/api/story";
import { ROUTES } from "@/lib/routes";
import { getHtmlExcerpt } from "@/utils/string";
import type { CommunityStats, LeaderboardEntry, StoryCard } from "@/types";
import { LandingDataNotice } from "./LandingDataNotice";
import { useNearViewport } from "./useNearViewport";

type CommunityData = { stats: CommunityStats | null; leaders: LeaderboardEntry[]; stories: StoryCard[] };

export function LandingCommunity() {
  const { ref, isNear } = useNearViewport<HTMLElement>();
  const [data, setData] = useState<CommunityData>({ stats: null, leaders: [], stories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isNear) return;
    let active = true;
    Promise.allSettled([
      communityService.getStats(),
      communityService.getLeaderboard(3),
      storyService.getStories({ limit: 2 }),
    ]).then(([stats, leaders, stories]) => {
      if (!active) return;
      setData({
        stats: stats.status === "fulfilled" ? stats.value.data : null,
        leaders: leaders.status === "fulfilled" ? leaders.value.data || [] : [],
        stories: stories.status === "fulfilled" ? stories.value.data || [] : [],
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [isNear]);

  const featuredStory = data.stories[0];

  return (
    <section id="community" ref={ref} className="landing-community relative px-5 py-22 sm:py-28">
      <span id="stories" className="landing-anchor" aria-hidden="true" />
      <span id="leaderboard" className="landing-anchor" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <span className="landing-section-kicker">KITA TUMBUH BERSAMA</span>
            <h2 className="landing-section-title mt-4">Di sini, kamu <span>tidak sendirian.</span></h2>
            <p className="landing-section-copy mt-4 max-w-xl">Cerita, dukungan, dan langkah kecil dari komunitas bisa mengingatkan kita bahwa setiap perjalanan punya waktunya sendiri.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {data.stats && Number.isFinite(Number(data.stats.active_members)) && (
              <span className="landing-stat-chip"><Users size={17} aria-hidden="true" /><strong>{Math.max(0, Number(data.stats.active_members)).toLocaleString("id-ID")}</strong> pengguna aktif</span>
            )}
            {data.stats && Number.isFinite(Number(data.stats.total_stories_published)) && (
              <span className="landing-stat-chip"><Heart size={17} aria-hidden="true" /><strong>{Math.max(0, Number(data.stats.total_stories_published)).toLocaleString("id-ID")}</strong> cerita dibagikan</span>
            )}
          </div>
        </div>

        <div className="mt-11 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="landing-community-story relative min-h-[390px] rounded-[2.2rem] border border-[#f7dadd] bg-white px-7 pb-56 pt-7 shadow-[0_24px_65px_-42px_rgba(123,65,94,0.35)] sm:p-9">
            <div className="relative z-10 max-w-full sm:max-w-[62%]">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#c55363]"><Sparkles size={17} aria-hidden="true" /> Cerita dari komunitas</span>
              {loading ? (
                <div className="mt-8 space-y-3" aria-label="Memuat cerita"><div className="h-5 w-3/4 animate-pulse rounded bg-rose-100" /><div className="h-4 w-full animate-pulse rounded bg-rose-100" /><div className="h-4 w-4/5 animate-pulse rounded bg-rose-100" /></div>
              ) : featuredStory ? (
                <>
                  <h3 className="font-brand-display mt-5 text-xl font-extrabold leading-snug text-[#283048] sm:text-2xl">{featuredStory.title}</h3>
                  <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600">“{getHtmlExcerpt(featuredStory.excerpt || "", 170)}”</p>
                  <p className="mt-4 text-xs font-semibold text-slate-500">{featuredStory.is_anonymous ? "Anonim" : featuredStory.author?.name || "Anggota komunitas"}</p>
                  <Link href={ROUTES.publicStoryDetail(featuredStory.id)} className="landing-text-link mt-5">Baca ceritanya <ArrowRight size={17} aria-hidden="true" /></Link>
                  <LandingDataNotice variant="public" className="mt-6" />
                </>
              ) : (
                <>
                  <h3 className="font-brand-display mt-5 text-xl font-extrabold text-[#283048] sm:text-2xl">Setiap cerita punya tempat.</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">“Aku belajar bahwa beristirahat juga bagian dari bertumbuh.”</p>
                  <p className="mt-3 text-xs text-slate-500">Contoh inspirasi ketika cerita publik belum tersedia.</p>
                  <Link href={ROUTES.PUBLIC_STORIES} className="landing-text-link mt-5">Jelajahi cerita <ArrowRight size={17} aria-hidden="true" /></Link>
                  <LandingDataNotice variant="demo" className="mt-6" />
                </>
              )}
            </div>
            <Image src="/images/landing/mascot/community.webp" alt="Maskot Ruang Tenang mengajak dengan ramah" width={640} height={960} sizes="(max-width: 640px) 180px, 250px" className="absolute -bottom-5 -right-4 z-10 h-60 w-auto max-w-[56%] object-contain object-bottom sm:-right-9 sm:h-94" />
          </div>
          <div className="landing-community-leaders relative rounded-[2.2rem] border border-[#e7e7fb] bg-[#f3f2ff] p-7 sm:p-9">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#a278bf]"><Trophy size={22} aria-hidden="true" /></div><div><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#9467a9]">APRESIASI KOMUNITAS</span><h3 className="font-brand-display text-xl font-extrabold text-[#283048]">Hall of Fame</h3></div></div>
            <p className="mt-4 text-sm leading-7 text-slate-600">Merayakan anggota yang aktif berbagi dukungan dan kebaikan.</p>
            <div className="mt-6 space-y-3" aria-live="polite">
              {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/70" />) : data.leaders.length > 0 ? data.leaders.slice(0, 3).map((leader, index) => (
                <div key={`${leader.user_id}-${index}`} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1de] font-brand-display font-black text-[#b77b46]">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#343b53]">{leader.name}</span>
                  <span className="text-xs font-bold text-[#916d9f]">{Number(leader.exp || 0).toLocaleString("id-ID")} XP</span>
                </div>
              )) : <p className="rounded-2xl bg-white/75 p-4 text-sm leading-6 text-slate-600">Belum ada peringkat publik saat ini. Kamu tetap bisa mengenal perjalanan komunitas.</p>}
            </div>
            <div className="mt-7 flex flex-wrap gap-5"><Link href={ROUTES.HALL_OF_FAME} className="landing-text-link">Lihat Hall of Fame <ArrowRight size={17} aria-hidden="true" /></Link><Link href={ROUTES.PUBLIC_STORIES} className="landing-text-link">Semua cerita <ArrowRight size={17} aria-hidden="true" /></Link></div>
          </div>
        </div>
      </div>
    </section>
  );
}
