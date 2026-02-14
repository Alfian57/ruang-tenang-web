export default function MusicLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-60 rounded bg-gray-200 animate-pulse" />
      </div>
      {/* Category cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-white overflow-hidden">
            <div className="h-32 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      {/* Playlist cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-4 space-y-3">
            <div className="h-24 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
