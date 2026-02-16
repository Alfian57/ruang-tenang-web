export default function NewStoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title & Description */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-6">
          {/* Title field */}
          <div className="space-y-1">
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Cover image */}
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
            <div className="h-40 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-3 w-56 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 w-24 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-72 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-10 w-20 rounded-lg bg-gray-200 animate-pulse" />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-48 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <div className="h-5 w-40 rounded bg-amber-200 animate-pulse" />
            <div className="space-y-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-3 w-3/4 rounded bg-amber-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <div className="h-10 w-16 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-40 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
