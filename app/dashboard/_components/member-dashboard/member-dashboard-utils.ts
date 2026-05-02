export function isToday(timestamp?: string) {
  if (!timestamp) return false;
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

export function isWithinLast7Days(timestamp?: string, now = Date.now()) {
  if (!timestamp) return false;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const time = new Date(timestamp).getTime();
  return Number.isFinite(time) && time >= sevenDaysAgo;
}

export function formatSyncTime(value?: Date | null) {
  return value
    ? value.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "belum sinkron";
}

export function formatQuotaReset(value?: string | null) {
  return value
    ? new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";
}

export function getGreetingEmoji(themeKey?: string) {
  if (themeKey === "ocean_calm") return "🌊";
  if (themeKey === "forest_zen") return "🌿";
  if (themeKey === "sunset_warmth") return "🌅";
  return "👋";
}
