"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";

export function ConsultationPromoWidget() {
  return (
    <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white overflow-hidden relative border-none shadow-md">
      <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            Butuh Teman Cerita?
          </h3>
          <p className="text-indigo-100 text-sm max-w-md">
            Ceritakan apa yang kamu rasakan. AI kami siap mendengarkan tanpa menghakimi, 24/7.
          </p>
        </div>
        <Link href={ROUTES.CHAT}>
          <Button className="bg-white text-violet-700 hover:bg-gray-100 font-semibold shadow-sm whitespace-nowrap border-none">
            <MessageCircle className="w-4 h-4 mr-2" />
            Mulai Obrolan
          </Button>
        </Link>
      </CardContent>
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
    </Card>
  );
}
