export default function AdminForumsLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="h-8 w-36 rounded bg-gray-200 animate-pulse" />
      <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
