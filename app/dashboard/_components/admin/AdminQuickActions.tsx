import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, FileText, Music } from "lucide-react";
import { formatDate } from "@/utils";
import { DashboardStats } from "@/types/admin";

interface AdminQuickActionsProps {
  stats: DashboardStats;
  isModerator: boolean;
}

export function AdminQuickActions({ stats, isModerator }: AdminQuickActionsProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      {!isModerator && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pengguna Terbaru</CardTitle>
            <CardDescription>5 pengguna terdaftar terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_users.map((recentUser) => (
                <div key={recentUser.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  recentUser.is_blocked ? 'bg-red-50 border border-red-100' : 'bg-muted/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      recentUser.is_blocked ? 'bg-red-100' : 'bg-primary/10'
                    }`}>
                      <span className={recentUser.is_blocked ? 'text-red-600 font-semibold' : 'text-primary font-semibold'}>
                        {recentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{recentUser.name}</p>
                        {recentUser.is_blocked && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600">Diblokir</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{recentUser.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      recentUser.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {recentUser.role}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(recentUser.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href={ROUTES.ADMIN.USERS}>
              <Button variant="outline" className="w-full mt-4">
                Lihat Semua Pengguna <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Kelola konten platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isModerator && (
            <Link href={ROUTES.ADMIN.USERS} className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Kelola Pengguna</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          )}
          <Link href={ROUTES.ADMIN.ARTICLES} className="block">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Kelola Artikel</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
          {!isModerator && (
            <Link href={ROUTES.ADMIN.SONGS} className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-purple-500" />
                  <span>Kelola Musik</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
