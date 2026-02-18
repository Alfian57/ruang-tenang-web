export function CommunitySkeleton() {
    return (
        <div className="space-y-8">
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mx-auto" />
                        <div className="h-6 w-20 rounded bg-gray-200 animate-pulse mx-auto" />
                        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse mx-auto" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                            <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                            <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Forum skeleton */}
            <div className="space-y-4">
                <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                                <div className="space-y-1 flex-1">
                                    <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                                    <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                                </div>
                            </div>
                            <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                            <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
