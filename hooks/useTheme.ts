"use client";

import { useAuthStore } from "@/store/authStore";

export type ThemeKey = "default" | "ocean_calm" | "forest_zen" | "sunset_warmth";

interface ThemeExclusivity {
  key: ThemeKey;
  greeting: string;
  journalCta: string;
  journalEmptyCta: string;
  journalEmptyTitle: string;
  journalEmptyDesc: string;
  breathingMotivation: string;
  dashboardSubtitle: string;
  storyLabel: string;
  /** Extra decorative CSS class applied to the dashboard wrapper */
  dashboardDecor: string;
}

const THEME_EXCLUSIVITY: Record<ThemeKey, ThemeExclusivity> = {
  default: {
    key: "default",
    greeting: "Bagaimana perasaanmu hari ini? Luangkan waktu sejenak untuk dirimu.",
    journalCta: "Lanjut Menulis",
    journalEmptyCta: "Tulis Jurnal Baru",
    journalEmptyTitle: "Hari ini belum menulis?",
    journalEmptyDesc: "Tuangkan pikiranmu dan rasakan kelegaannya.",
    breathingMotivation: "Pertahankan semangat bernapasmu!",
    dashboardSubtitle: "Luangkan waktu sejenak untuk dirimu",
    storyLabel: "Kisah Minggu Ini",
    dashboardDecor: "",
  },
  ocean_calm: {
    key: "ocean_calm",
    greeting: "Ombak tenang membawa ketenangan. Nikmati momen ini.",
    journalCta: "Menulis di Tepi Laut",
    journalEmptyCta: "Mulai Menulis",
    journalEmptyTitle: "Biarkan pikiran mengalir",
    journalEmptyDesc: "Seperti ombak, biarkan kata-kata mengalir dari hatimu.",
    breathingMotivation: "Bernapas selaras dengan irama laut",
    dashboardSubtitle: "Biarkan ketenangan laut menemanimu",
    storyLabel: "Cerita dari Samudra",
    dashboardDecor: "ocean-decor",
  },
  forest_zen: {
    key: "forest_zen",
    greeting: "Teduhnya hutan menanti. Temukan kedamaian di sini.",
    journalCta: "Menulis di Bawah Pohon",
    journalEmptyCta: "Mulai Ceritamu",
    journalEmptyTitle: "Temukan ketenangan di sini",
    journalEmptyDesc: "Seperti hutan yang tenang, tuliskan apa yang ada di hatimu.",
    breathingMotivation: "Hirup udara segar hutan dalam-dalam",
    dashboardSubtitle: "Temukan kedamaian di bawah rindangnya pohon",
    storyLabel: "Bisikan Hutan",
    dashboardDecor: "forest-decor",
  },
  sunset_warmth: {
    key: "sunset_warmth",
    greeting: "Senja yang hangat menyambutmu. Waktu untuk refleksi.",
    journalCta: "Menulis di Senja",
    journalEmptyCta: "Tulis di Cahaya Senja",
    journalEmptyTitle: "Senja memanggil ceritamu",
    journalEmptyDesc: "Di bawah cahaya senja, setiap kata terasa lebih bermakna.",
    breathingMotivation: "Bernapas dengan kehangatan senja",
    dashboardSubtitle: "Nikmati kehangatan dan refleksi bersama senja",
    storyLabel: "Kisah Senja",
    dashboardDecor: "sunset-decor",
  },
};

export function useTheme() {
  const { user } = useAuthStore();
  const themeKey = (user?.profile_theme || "default") as ThemeKey;
  const exclusivity = THEME_EXCLUSIVITY[themeKey] || THEME_EXCLUSIVITY.default;
  const isDefault = themeKey === "default";

  return {
    themeKey,
    isDefault,
    exclusivity,
  };
}
