"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export function ConsultationPromoWidget() {
  return (
    <Card className="member-chat-card relative h-full overflow-hidden border-0 shadow-sm">
      <CardContent className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="member-chat-copy">
          <p className="member-chat-eyebrow"><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Teman bicara</p>
          <h3>Butuh teman cerita?</h3>
          <p>Ceritakan apa yang kamu rasakan. Ada ruang untuk didengarkan tanpa menghakimi.</p>
        </div>
        <Button asChild className="member-chat-action w-fit gap-2 rounded-full border-0 px-4">
          <Link href={ROUTES.CHAT}><MessageCircle className="h-4 w-4" /> Mulai Obrolan <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </CardContent>
      <div className="member-chat-orbit" aria-hidden="true" />
      <div className="member-chat-art" aria-hidden="true">
        <Image src="/images/landing/mascot/companion.webp" alt="" fill sizes="(max-width: 540px) 150px, 190px" className="object-contain object-bottom" />
      </div>
    </Card>
  );
}
