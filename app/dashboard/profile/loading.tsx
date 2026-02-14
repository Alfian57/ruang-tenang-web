export default function ProfileLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
