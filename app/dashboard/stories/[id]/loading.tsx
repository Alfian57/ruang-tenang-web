export default function StoryDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cover Image */}
        <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-gray-200 animate-pulse" />

        {/* Title & Meta */}
        <div className="mb-8 space-y-4">
          <div className="h-6 w-24 rounded-full bg-amber-200 animate-pulse" />
          <div className="h-10 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Categories & Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3 mb-8">
          <div className="h-5 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-5/6 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-4/5 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 py-6 border-y mb-8">
          <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />

          {/* Comment input */}
          <div className="space-y-3">
            <div className="h-20 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Comment items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="h-7 w-10 rounded bg-gray-200 animate-pulse mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
