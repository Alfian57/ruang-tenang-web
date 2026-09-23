import Image from "next/image";
import { Smile } from "lucide-react";
import type { MoodType } from "@/types";
import { MOOD_ASSETS } from "@/app/dashboard/_components/mood-config";

const MOOD_LABELS: Record<string, MoodType> = {
    bahagia: "happy",
    happy: "happy",
    senang: "happy",
    netral: "neutral",
    neutral: "neutral",
    sedih: "sad",
    sad: "sad",
    kecewa: "disappointed",
    disappointed: "disappointed",
    marah: "angry",
    angry: "angry",
    menangis: "crying",
    crying: "crying",
};

const MOOD_IDS: Record<number, MoodType> = {
    1: "happy",
    2: "neutral",
    3: "sad",
    4: "disappointed",
    5: "angry",
    6: "crying",
};

function resolveMoodType(moodLabel?: string, moodId?: number): MoodType | undefined {
    if (moodId && MOOD_IDS[moodId]) return MOOD_IDS[moodId];
    if (!moodLabel) return undefined;

    const normalized = moodLabel.trim().toLowerCase();
    return MOOD_LABELS[normalized];
}

interface MoodAssetIconProps {
    moodLabel?: string;
    moodId?: number;
    size?: number;
    className?: string;
}

export function MoodAssetIcon({ moodLabel, moodId, size = 32, className }: MoodAssetIconProps) {
    const moodType = resolveMoodType(moodLabel, moodId);
    const asset = moodType ? MOOD_ASSETS[moodType].active : undefined;

    if (!asset) {
        return <Smile className={className} size={size} aria-hidden="true" />;
    }

    return (
        <Image
            src={asset}
            alt={moodLabel || "Mood"}
            width={size}
            height={size}
            className={className}
        />
    );
}
