export default function JournalDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Journal content card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded bg-gray-200 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-14 rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Content */}
        <div className="space-y-3 pt-4 border-t">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* AI Share toggle */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-1">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-48 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
