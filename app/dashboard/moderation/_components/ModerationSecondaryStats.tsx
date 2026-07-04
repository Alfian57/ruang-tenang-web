import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Users, Ban } from "lucide-react";
import { ModerationStats } from "@/types/moderation";

interface ModerationSecondaryStatsProps {
    stats: ModerationStats | null;
}

export function ModerationSecondaryStats({ stats }: ModerationSecondaryStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-amber-500 flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Strike Aktif</p>
                            <h3 className="text-3xl font-bold">{stats?.active_strikes ?? "-"}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pengguna Disuspend</p>
                            <h3 className="text-3xl font-bold">{stats?.suspended_users ?? "-"}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pengguna Dibanned</p>
                            <h3 className="text-3xl font-bold">{stats?.banned_users ?? "-"}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Ban className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
