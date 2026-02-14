export default function ReadingLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
      <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-4 flex gap-4">
            <div className="h-24 w-20 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-20 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
