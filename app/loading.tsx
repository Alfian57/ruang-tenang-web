import { Skeleton } from "@/components/ui/skeleton";

function SectionHeaderSkeleton() {
  return (
    <div className="space-y-4 text-center">
      <Skeleton className="h-6 w-36 mx-auto rounded-full" />
      <Skeleton className="h-10 w-full max-w-2xl mx-auto" />
      <Skeleton className="h-5 w-full max-w-xl mx-auto" />
    </div>
  );
}

function FeatureCardsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border p-7 space-y-4 bg-card/60">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-card/90 backdrop-blur-md rounded-[15px] shadow-lg px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-28" />
          <div className="hidden md:flex items-center gap-3">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      <main>
        <section className="relative min-h-screen flex items-center pt-24 pb-12">
          <div className="container mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                <Skeleton className="h-14 w-full max-w-xl" />
                <Skeleton className="h-14 w-full max-w-lg" />
                <Skeleton className="h-14 w-3/4 max-w-md" />
                <Skeleton className="h-5 w-full max-w-xl" />
                <Skeleton className="h-5 w-full max-w-lg" />
                <Skeleton className="h-5 w-5/6 max-w-md" />
                <Skeleton className="h-12 w-56 rounded-[15px]" />
              </div>

              <div className="relative order-1 lg:order-2">
                <Skeleton className="aspect-5/6 w-full max-w-md lg:max-w-lg mx-auto rounded-3xl" />
                <Skeleton className="absolute top-6 right-2 h-20 w-44 rounded-2xl" />
                <Skeleton className="absolute bottom-16 left-2 h-20 w-44 rounded-2xl" />
                <Skeleton className="absolute top-1/3 right-0 h-20 w-44 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl space-y-16">
            <SectionHeaderSkeleton />
            <FeatureCardsSkeleton />
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            </div>
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl space-y-16">
            <SectionHeaderSkeleton />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-56 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="container mx-auto max-w-3xl text-center space-y-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-5 w-full max-w-xl mx-auto" />
            <Skeleton className="h-5 w-5/6 max-w-lg mx-auto" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Skeleton className="h-14 w-52 rounded-2xl" />
              <Skeleton className="h-14 w-52 rounded-2xl" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-1">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="flex gap-3 pt-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-9 rounded-full" />
                ))}
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, columnIndex) => (
              <div key={columnIndex} className="space-y-4">
                <Skeleton className="h-5 w-28" />
                {Array.from({ length: 5 }).map((_, itemIndex) => (
                  <Skeleton key={itemIndex} className="h-4 w-full max-w-50" />
                ))}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4">
            <Skeleton className="h-4 w-60" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
