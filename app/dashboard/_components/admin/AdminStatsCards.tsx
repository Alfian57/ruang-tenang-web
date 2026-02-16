import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  MessageCircle,
} from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface AdminStatsCardsProps {
  stats: DashboardStats;
  isModerator: boolean;
}

export function AdminStatsCards({ stats, isModerator }: AdminStatsCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {!isModerator && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengguna</p>
                <h3 className="text-3xl font-bold">{stats.users.total.toLocaleString()}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {stats.users.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stats.users.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.users.growth >= 0 ? '+' : ''}{stats.users.growth.toFixed(1)}% bulan ini
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            {/* Mini Chart */}
            <div className="flex items-end gap-1 mt-4 h-10">
              {stats.users.chart_data.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t"
                  style={{ height: `${Math.max(10, (value / Math.max(...stats.users.chart_data, 1)) * 100)}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Artikel</p>
              <h3 className="text-3xl font-bold">{stats.articles.total}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                +{stats.articles.this_month} bulan ini
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sesi Chat</p>
              <h3 className="text-3xl font-bold">{stats.chat_sessions.total.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                +{stats.chat_sessions.today} hari ini
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          {/* Mini Chart */}
          <div className="flex items-end gap-1 mt-4 h-10">
            {stats.chat_sessions.chart_data.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-orange-500/20 rounded-t"
                style={{ height: `${Math.max(10, (value / Math.max(...stats.chat_sessions.chart_data, 1)) * 100)}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pesan</p>
              <h3 className="text-3xl font-bold">{stats.messages.total.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                +{stats.messages.today} hari ini
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
