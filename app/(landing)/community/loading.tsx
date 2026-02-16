export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b bg-white" />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-48 rounded bg-gray-200 animate-pulse mx-auto" />
          <div className="h-4 w-72 rounded bg-gray-200 animate-pulse mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
