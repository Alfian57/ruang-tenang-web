import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";

export function RuNaAvatar() {
  return (
    <Avatar className="mt-0.5 h-9 w-9 shrink-0 border border-rose-100 bg-rose-50 shadow-sm sm:h-10 sm:w-10">
      <Image
        src="/images/dashboard/mascot/chat-listen.webp"
        alt="RuNa"
        width={40}
        height={40}
        className="h-full w-full object-contain"
      />
    </Avatar>
  );
}
