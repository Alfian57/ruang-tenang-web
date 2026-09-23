import { PublicPageHero } from "../_components/PublicPageHero";
import "./hall-of-fame.css";

export default function HallOfFameLoading() {
  return (
    <div className="public-page">
      <div className="fixed top-4 left-1/2 z-50 h-16 w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 rounded-full border border-[#f3e2e1] bg-white/95 shadow-lg" aria-hidden="true" />

      <div className="mx-auto w-full max-w-6xl px-4 pt-40 pb-20 sm:px-6 sm:pt-44 lg:px-8">
        <div className="hall-hero-shell mx-auto max-w-5xl"><PublicPageHero compact eyebrow="Ruang apresiasi" title={<>Hall of <span>Fame</span></>} description="Rayakan anggota yang menghadirkan energi positif, dukungan, dan inspirasi di komunitas Ruang Tenang." pose="trophy" /></div>
        <div className="mx-auto max-w-5xl space-y-8">

        {/* Featured cards skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-h-64 animate-pulse rounded-3xl border border-red-100 bg-[#fff2ef] p-6 flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 mb-3" />
              <div className="w-20 h-20 rounded-2xl bg-gray-100 mb-4" />
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-7 bg-gray-100 rounded-full w-20" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="rounded-3xl border border-red-100 bg-white p-5">
          <div className="mb-4 h-5 w-52 animate-pulse rounded bg-gray-100" />
          <div className="flex gap-2 overflow-hidden">{[1, 2, 3, 4].map((i) => <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-gray-100" />)}</div>
        </div>

        {/* List skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 animate-pulse rounded-3xl border border-gray-100 bg-white p-5"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-gray-100" /><div className="space-y-2"><div className="h-4 w-28 rounded bg-gray-100" /><div className="h-3 w-20 rounded bg-gray-100" /></div></div><div className="mt-5 h-5 w-32 rounded bg-gray-100" /></div>)}
        </div>
        </div>
      </div>
    </div>
  );
}
