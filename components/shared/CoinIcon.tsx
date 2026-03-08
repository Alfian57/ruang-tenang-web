import Image from "next/image";

import { cn } from "@/utils";

interface CoinIconProps {
    className?: string;
    alt?: string;
}

export function CoinIcon({ className, alt = "Coin" }: CoinIconProps) {
    return (
        <Image
            src="/coin.png"
            alt={alt}
            width={20}
            height={20}
            className={cn(
                "inline-block h-5 w-5 object-contain select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] saturate-150 contrast-125 brightness-110",
                className
            )}
        />
    );
}
