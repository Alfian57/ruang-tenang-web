export default function AdminDashboardLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-8 w-56 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-72 rounded bg-gray-200 animate-pulse" />
      </div>
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
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-full rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="rounded-xl border bg-white p-6 space-y-3">
          <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
