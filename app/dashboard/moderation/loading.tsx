export default function ModerationLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="h-8 w-36 rounded bg-gray-200 animate-pulse" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
