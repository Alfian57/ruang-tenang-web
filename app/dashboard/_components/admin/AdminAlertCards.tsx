import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, ChevronRight, AlertTriangle } from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface AdminAlertCardsProps {
  stats: DashboardStats;
}

export function AdminAlertCards({ stats }: AdminAlertCardsProps) {
  if (stats.users.blocked <= 0 && stats.articles.blocked <= 0) return null;

  return (
    <div className="mb-6 grid sm:grid-cols-2 gap-4">
      {stats.users.blocked > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Ban className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-orange-800">{stats.users.blocked} Pengguna Diblokir</p>
                <p className="text-sm text-orange-600">Memerlukan perhatian</p>
              </div>
            </div>
            <Link href={ROUTES.ADMIN.USERS}>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Lihat <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      {stats.articles.blocked > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">{stats.articles.blocked} Artikel Diblokir</p>
                <p className="text-sm text-red-600">Perlu ditinjau</p>
              </div>
            </div>
            <Link href={ROUTES.ADMIN.ARTICLES}>
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                Lihat <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
