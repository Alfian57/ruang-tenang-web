export default function ArticlesPublicLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b bg-white" />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-36 rounded bg-gray-200 animate-pulse mx-auto" />
          <div className="h-4 w-64 rounded bg-gray-200 animate-pulse mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border bg-white overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
