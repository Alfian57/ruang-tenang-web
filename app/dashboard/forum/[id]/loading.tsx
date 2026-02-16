export default function ForumThreadLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Main Topic Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
              <div className="h-8 w-24 rounded bg-gray-200 animate-pulse" />
              <div className="h-8 w-20 rounded bg-gray-200 animate-pulse ml-auto" />
            </div>
          </div>

          {/* Divider */}
          <div className="flex justify-center">
            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Reply Input */}
          <div className="bg-white border p-4 rounded-xl shadow-sm">
            <div className="flex gap-3">
              <div className="flex-1 h-11 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-11 w-11 rounded-xl bg-gray-200 animate-pulse shrink-0" />
            </div>
          </div>

          {/* Reply Bubbles */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-white shadow-sm border space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                  <div className="pt-2 border-t border-gray-100/50">
                    <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
