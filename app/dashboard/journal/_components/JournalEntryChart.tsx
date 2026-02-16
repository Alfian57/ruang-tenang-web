import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart2 } from "lucide-react";
import { JournalAnalytics } from "@/types";

interface JournalEntryChartProps {
    analytics: JournalAnalytics;
}

export function JournalEntryChart({ analytics }: JournalEntryChartProps) {
    // Prepare entries by month data for bar chart
    const monthlyData = (analytics.entries_by_month || []).map((item) => ({
        month: item.month,
        count: item.count,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    Jurnal per Bulan
                </CardTitle>
            </CardHeader>
            <CardContent>
                {monthlyData.length > 0 ? (
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="month" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Belum ada data</p>
                )}
            </CardContent>
        </Card>
    );
}
