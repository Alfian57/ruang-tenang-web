export default function AdminArticlesLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="rounded-xl border bg-white overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <div className="h-16 w-20 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
