export default function EditArticleLoading() {
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
        <div className="space-y-1">
          <div className="h-7 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl rounded-xl border bg-white overflow-hidden">
        <div className="p-6 border-b">
          <div className="h-6 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="p-6 space-y-6">
          {/* Title field */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Category field */}
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Thumbnail field */}
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-40 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-3 w-64 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Content field */}
          <div className="space-y-2">
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
            <div className="h-64 w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <div className="h-10 w-20 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-36 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
