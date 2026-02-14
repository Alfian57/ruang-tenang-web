"use client";

import { BreathingSession, formatBreathingDuration } from "@/types/breathing";
import { Wind, History, Clock, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface HistoryViewProps {
    isLoading: boolean;
    sessions: BreathingSession[];
    sessionsTotal: number;
    onStart: () => void;
}

export function HistoryView({
    isLoading,
    sessions,
    sessionsTotal,
    onStart,
}: HistoryViewProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Wind className="w-10 h-10 text-primary animate-pulse mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Memuat riwayat...</p>
                </div>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <EmptyState
                icon={<History className="w-8 h-8 text-muted-foreground" />}
                title="Belum ada riwayat latihan"
                description="Mulai sesi latihan pernapasan pertamamu dan riwayatnya akan muncul di sini."
                action={{
                    label: "Mulai Latihan",
                    onClick: onStart,
                }}
                className="py-16"
            />
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {sessionsTotal} sesi tercatat
            </p>
            <div className="space-y-3">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                style={{
                                    backgroundColor: session.technique?.color ? `${session.technique.color}20` : "var(--muted)",
                                    color: session.technique?.color || "var(--muted-foreground)",
                                }}
                            >
                                💨
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                    {session.technique?.name || "Latihan Pernapasan"}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatBreathingDuration(session.duration_seconds)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(session.started_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                {session.completed ? (
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                        Selesai
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                                        {session.completed_percentage}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
