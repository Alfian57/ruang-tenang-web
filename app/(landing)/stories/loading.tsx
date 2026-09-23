import { PublicPageHero } from "../_components/PublicPageHero";

export default function StoriesPublicLoading() {
  return (
    <div className="public-page">
      <div className="h-16 border-b bg-white" />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <PublicPageHero eyebrow="Dari hati ke hati" title={<>Cerita <span>Inspiratif</span></>} description="Sedang menyiapkan kisah-kisah komunitas." pose="listen" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
