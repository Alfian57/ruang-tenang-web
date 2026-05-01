import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressMapLoading() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6 space-y-6">
            <Skeleton className="h-16 w-full max-w-80 rounded-xl" />
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-16 rounded-xl" />
            <div className="space-y-6 max-w-4xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                        <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shrink-0" />
                        <Skeleton className="flex-1 h-24 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
