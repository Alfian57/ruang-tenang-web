export default function AdminLevelsLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 rounded bg-gray-200 animate-pulse" />
        <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-2 w-full rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
