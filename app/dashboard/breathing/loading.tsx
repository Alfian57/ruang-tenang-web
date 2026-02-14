export default function BreathingLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-72 rounded bg-gray-200 animate-pulse" />
      </div>
      {/* Technique cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
