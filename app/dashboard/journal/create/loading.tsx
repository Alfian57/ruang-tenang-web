export default function CreateJournalLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-7 w-36 rounded bg-gray-200 animate-pulse" />
      </div>

      {/* Editor skeleton */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        {/* Title field */}
        <div className="space-y-2">
          <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
        </div>

        {/* Mood selector */}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Writing prompt */}
        <div className="p-4 bg-amber-50 rounded-lg space-y-2">
          <div className="h-4 w-28 rounded bg-amber-200 animate-pulse" />
          <div className="h-3 w-full rounded bg-amber-200 animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-amber-200 animate-pulse" />
        </div>

        {/* Content field */}
        <div className="space-y-2">
          <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
          <div className="h-48 w-full rounded-lg bg-gray-200 animate-pulse" />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <div className="h-10 w-20 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
