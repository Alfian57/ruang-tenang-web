import Link from "next/link";
import { Calendar, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface MemberDashboardHeaderProps {
  viewModel: MemberDashboardViewModel;
}

export function MemberDashboardHeader({ viewModel }: MemberDashboardHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 xs:text-2xl md:text-3xl">
          Halo, <span className="text-primary">{viewModel.user?.name?.split(" ")[0] || "Teman"}!</span> {viewModel.theme.greetingEmoji}
        </h1>
        <p className="mt-1 text-base text-gray-500 md:text-lg">
          {viewModel.theme.greeting}
        </p>
      </div>
      <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:gap-3">
        <Link href={ROUTES.JOURNAL}>
          <Button variant="outline" className="rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors gap-2">
            <Calendar className="w-4 h-4" />
            Tulis Jurnal
          </Button>
        </Link>
        <Link data-user-tour="user-chat-ai" href={viewModel.header.isChatLimitExhausted ? ROUTES.BILLING : ROUTES.CHAT}>
          <Button className={`rounded-full shadow-lg hover:shadow-xl transition-all gap-2 border-0 ${viewModel.header.isChatLimitExhausted ? "bg-amber-600 hover:bg-amber-700" : "bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"}`}>
            {viewModel.header.isChatLimitExhausted ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {viewModel.header.isChatLimitExhausted ? "Limit Chat Habis" : "Teman Cerita AI"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
