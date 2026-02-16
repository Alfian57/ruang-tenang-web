import { Card, CardContent } from "@/components/ui/card";
import { Users, FolderOpen, Music, Heart } from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface AdminSummaryCardsProps {
  stats: DashboardStats;
  isModerator: boolean;
}

export function AdminSummaryCards({ stats, isModerator }: AdminSummaryCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {!isModerator && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                <p className="font-semibold">{stats.users.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kategori Artikel</p>
              <p className="font-semibold">{stats.articles.categories}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {!isModerator && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Music className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Musik</p>
                <p className="font-semibold">{stats.songs.total} lagu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mood Hari Ini</p>
              <p className="font-semibold">{stats.moods.today}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
