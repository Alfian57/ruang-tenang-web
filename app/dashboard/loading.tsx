export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
        <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-8 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-48 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
