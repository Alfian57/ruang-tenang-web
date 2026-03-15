export default function HallOfFameLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar placeholder */}
      <div className="h-16 border-b bg-white" />

      <div className="max-w-6xl mx-auto px-4 pt-32 pb-20 space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <div className="h-7 w-44 rounded-full bg-gray-100 animate-pulse mx-auto" />
          <div className="h-10 w-80 rounded bg-gray-100 animate-pulse mx-auto" />
          <div className="h-5 w-96 rounded bg-gray-100 animate-pulse mx-auto" />
        </div>

        {/* Featured cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-3xl p-6 flex flex-col items-center animate-pulse"
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
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-gray-100 animate-pulse"
            />
          ))}
        </div>

        {/* List skeleton */}
        <div className="rounded-3xl border border-gray-100 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="px-5 py-4 border-b border-gray-50 last:border-b-0 flex items-center gap-4 animate-pulse"
            >
              <div className="w-11 h-11 rounded-2xl bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
