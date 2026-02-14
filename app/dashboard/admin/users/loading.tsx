export default function AdminUsersLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
