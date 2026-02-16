import { TechniqueUsageStats } from "@/types/breathing";
import { Clock } from "lucide-react";

interface TechniqueUsageChartProps {
    usage: TechniqueUsageStats[];
}

export function TechniqueUsageChart({ usage }: TechniqueUsageChartProps) {
    if (usage.length === 0) {
        return (
            <div className="p-4 rounded-xl bg-card border text-center py-8">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Belum ada data penggunaan teknik</p>
            </div>
        );
    }

    const colors = [
        "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
        "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    ];

    return (
        <div className="p-4 rounded-xl bg-card border">
            <h3 className="font-semibold mb-4">Teknik yang Digunakan</h3>

            <div className="space-y-3">
                {usage.map((item, index) => (
                    <div key={item.technique_id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">{item.technique_name}</span>
                            <span className="text-muted-foreground">
                                {item.sessions_count} sesi ({Math.round(item.percentage)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${item.percentage}%`,
                                    backgroundColor: colors[index % colors.length],
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
