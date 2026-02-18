export function StoriesSkeleton() {
    return (
        <div className="space-y-6">
            {/* Featured skeleton */}
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                            <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                        </div>
                        <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                    </div>
                ))}
            </div>

            {/* CTA skeleton */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                        <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                        <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Story list skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                            <div className="space-y-1 flex-1">
                                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                                <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                            </div>
                        </div>
                        <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
                        <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
                        <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
