import { MoodType } from "@/types";

export const MOOD_ASSETS: Record<
  MoodType,
  { label: string; active: string; inactive: string }
> = {
  happy: {
    label: "Bahagia",
    active: "/images/1-happy-active.png",
    inactive: "/images/1-smile.png",
  },
  neutral: {
    label: "Netral",
    active: "/images/2-netral-active.png",
    inactive: "/images/2-netral.png",
  },
  angry: {
    label: "Marah",
    active: "/images/3-angry-active.png",
    inactive: "/images/3-angry.png",
  },
  disappointed: {
    label: "Kecewa",
    active: "/images/4-disappointed-active.png",
    inactive: "/images/4-disappointed.png",
  },
  sad: {
    label: "Sedih",
    active: "/images/5-sad-active.png",
    inactive: "/images/5-sad.png",
  },
  crying: {
    label: "Menangis",
    active: "/images/6-cry-active.png",
    inactive: "/images/6-cry.png",
  },
};

export const MOOD_ORDER: MoodType[] = [
  "happy",
  "neutral",
  "sad",
  "disappointed",
  "angry",
  "crying",
];