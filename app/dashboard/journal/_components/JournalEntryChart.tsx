import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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
        <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-theme-accent-soft text-theme-accent-dark">
                        <BarChart2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <CardTitle className="text-base text-slate-900">Aktivitas menulis</CardTitle>
                        <p className="mt-1 text-xs text-slate-500">Jumlah jurnal yang kamu buat per bulan</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {monthlyData.length > 0 ? (
                    <div className="h-48 w-full sm:h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <Tooltip cursor={{ fill: "var(--theme-accent-soft)" }} />
                                <Bar dataKey="count" name="Jurnal" fill="var(--theme-accent)" radius={[6, 6, 0, 0]} maxBarSize={38} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-50/80 px-4 text-center">
                        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Belum ada data aktivitas</p>
                        <p className="mt-1 text-xs text-slate-500">Grafik akan terisi seiring jurnal yang kamu tulis.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
