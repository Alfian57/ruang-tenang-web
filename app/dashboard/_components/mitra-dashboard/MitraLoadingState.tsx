export function MitraLoadingState() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[112rem] space-y-6 bg-gradient-to-br from-gray-50 via-white to-red-50/40 p-3 xs:p-4 lg:p-6">
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
