export default function GuildsLoading() {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="animate-pulse space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-7 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-64 mt-2" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 bg-gray-200 rounded-lg w-32" />
                        <div className="h-9 bg-gray-200 rounded-lg w-28" />
                    </div>
                </div>
                <div className="h-20 bg-gray-200 rounded-2xl" />
                <div className="flex gap-4 border-b pb-2">
                    <div className="h-8 bg-gray-200 rounded w-28" />
                    <div className="h-8 bg-gray-200 rounded w-28" />
                </div>
                <div className="grid gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
