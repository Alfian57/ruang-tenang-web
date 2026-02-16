import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Users, Ban } from "lucide-react";
import { ModerationStats } from "@/types/moderation";

interface ModerationSecondaryStatsProps {
    stats: ModerationStats | null;
}

export function ModerationSecondaryStats({ stats }: ModerationSecondaryStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Strike Aktif</CardTitle>
                    <XCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.active_strikes ?? "-"}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pengguna Disuspend</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.suspended_users ?? "-"}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pengguna Dibanned</CardTitle>
                    <Ban className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.banned_users ?? "-"}</div>
                </CardContent>
            </Card>
        </div>
    );
}
