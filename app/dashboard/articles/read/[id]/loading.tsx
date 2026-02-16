export default function ReadArticleLoading() {
  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm space-y-6">
              {/* Title */}
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-4">
                  <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>

              {/* Thumbnail */}
              <div className="h-64 w-full rounded-2xl bg-gray-200 animate-pulse" />

              {/* Content paragraphs */}
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              </div>

              {/* Report button */}
              <div className="pt-6 border-t flex justify-end">
                <div className="h-8 w-36 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="h-6 w-32 rounded bg-gray-200 animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-16 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
