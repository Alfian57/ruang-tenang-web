export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b bg-white" />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-48 rounded bg-gray-200 animate-pulse mx-auto" />
          <div className="h-4 w-64 rounded bg-gray-200 animate-pulse mx-auto" />
        </div>
        {/* Top 3 podium */}
        <div className="flex justify-center gap-4 py-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
              <div className="h-5 w-12 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
        {/* List */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-4 flex items-center gap-4">
              <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
