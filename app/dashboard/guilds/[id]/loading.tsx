export default function GuildDetailLoading() {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="animate-pulse space-y-6">
                {/* Back link */}
                <div className="h-4 bg-gray-200 rounded w-20" />

                {/* Guild header */}
                <div className="bg-gray-100 rounded-2xl border p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <div className="h-6 bg-gray-200 rounded w-48" />
                            <div className="h-4 bg-gray-200 rounded w-72" />
                            <div className="flex gap-4">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="h-4 bg-gray-200 rounded w-20" />
                                <div className="h-4 bg-gray-200 rounded w-28" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b pb-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded w-24" />
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-32" />
                        <div className="h-32 bg-gray-200 rounded-xl" />
                        <div className="h-32 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-28" />
                        <div className="h-48 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
