export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Skeleton card */}
        <div className="w-80 rounded-xl bg-card p-6 shadow-md space-y-4">
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
          <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />
          <div className="flex gap-3">
            <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}
