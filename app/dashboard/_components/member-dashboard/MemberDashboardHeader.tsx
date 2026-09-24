import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot, Calendar, CalendarDays, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface MemberDashboardHeaderProps {
  viewModel: MemberDashboardViewModel;
}

export function MemberDashboardHeader({ viewModel }: MemberDashboardHeaderProps) {
  return (
    <section className="member-dashboard-hero" aria-labelledby="member-dashboard-title">
      <div className="member-dashboard-hero-copy">
        <p className="member-dashboard-eyebrow"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Ruangmu hari ini</p>
        <h1 id="member-dashboard-title" data-user-tour="user-welcome" className="member-dashboard-hero-title">
          Halo, <span>{viewModel.user?.name?.split(" ")[0] || "Teman"}!</span>
        </h1>
        <p className="member-dashboard-hero-description">{viewModel.theme.greeting}</p>
        <p className="member-dashboard-hero-note">Tak perlu terburu-buru. Mulai dari satu hal kecil yang kamu butuhkan.</p>
        <div className="member-dashboard-hero-actions">
          <Button asChild className="member-dashboard-primary-action gap-2 rounded-full border-0 px-5">
            <Link href={ROUTES.JOURNAL}><Calendar className="h-4 w-4" /> Tulis Jurnal <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="member-dashboard-secondary-action gap-2 rounded-full px-5">
            <Link data-user-tour="user-chat-ai" href={viewModel.header.isChatLimitExhausted ? ROUTES.BILLING : ROUTES.CHAT}>
              {viewModel.header.isChatLimitExhausted ? <Lock className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              {viewModel.header.isChatLimitExhausted ? "Limit Chat Habis" : "Teman Cerita AI"}
            </Link>
          </Button>
        </div>
      </div>
      <div className="member-dashboard-hero-art" aria-hidden="true">
        <span className="member-dashboard-hero-orbit" />
        <Image src="/images/dashboard/mascot/student-welcome.webp" alt="" fill priority sizes="(max-width: 640px) 210px, (max-width: 1024px) 270px, 340px" className="object-contain object-bottom" />
      </div>
    </section>
  );
}
