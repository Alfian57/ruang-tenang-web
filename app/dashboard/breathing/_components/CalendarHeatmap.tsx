import { BreathingCalendarDay } from "@/types/breathing";
import { Calendar } from "lucide-react";
import { cn } from "@/utils";

interface CalendarHeatmapProps {
    days: BreathingCalendarDay[];
    month: number;
    year: number;
}

export function CalendarHeatmap({ days, month, year }: CalendarHeatmapProps) {
    const dayMap = new Map(days.map(d => [d.date, d]));

    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startingDay = firstDay.getDay();

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const calendarDays: (BreathingCalendarDay | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        calendarDays.push(dayMap.get(dateStr) || {
            date: dateStr,
            sessions_count: 0,
            total_minutes: 0,
            techniques_used: [],
            intensity: 0,
        });
    }

    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 3: return "bg-green-500";
            case 2: return "bg-green-400";
            case 1: return "bg-green-300";
            default: return "bg-muted";
        }
    };

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
        <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{monthNames[month - 1]} {year}</h3>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            "aspect-square rounded-md flex items-center justify-center text-xs",
                            day ? getIntensityColor(day.intensity) : "bg-transparent",
                            day && day.sessions_count > 0 && "cursor-pointer hover:ring-2 hover:ring-primary"
                        )}
                        title={day ? `${day.date}: ${day.sessions_count} sesi, ${day.total_minutes} menit` : ""}
                    >
                        {day && (
                            <span className={cn(
                                day.intensity > 0 ? "text-white font-medium" : "text-muted-foreground"
                            )}>
                                {parseInt(day.date.split("-")[2])}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Kurang</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <div className="w-3 h-3 rounded bg-green-300" />
                    <div className="w-3 h-3 rounded bg-green-400" />
                    <div className="w-3 h-3 rounded bg-green-500" />
                </div>
                <span>Banyak</span>
            </div>
        </div>
    );
}
