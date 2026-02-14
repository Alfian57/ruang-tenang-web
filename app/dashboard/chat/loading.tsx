export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-white">
      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-2xl p-4 space-y-2 ${i % 2 === 0 ? "bg-gray-200 w-2/5" : "bg-gray-100 w-3/5"}`}>
                <div className="h-3 w-full rounded bg-gray-300 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-gray-300 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="border-t p-4">
          <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </div>
      {/* Sidebar */}
      <div className="hidden lg:block w-80 border-l p-4 space-y-3">
        <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 w-full rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
