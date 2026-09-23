export function MitraLoadingState() {
  return (
    <div className="min-h-screen w-full space-y-6 py-3 xs:py-4 lg:py-6">
      <div className="h-32 animate-pulse rounded-2xl border border-red-100 bg-red-50/70" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-100 bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white" />
    </div>
  );
}
