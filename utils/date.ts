import { env } from "@/config/env";

/**
 * Date formatting utilities with Indonesian locale.
 */

const APP_TIMEZONE = env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
const TIMEZONE_OFFSETS: Record<string, string> = {
  "Asia/Jakarta": "+07:00",
  "Asia/Makassar": "+08:00",
  "Asia/Jayapura": "+09:00",
};
const APP_TIMEZONE_OFFSET = TIMEZONE_OFFSETS[APP_TIMEZONE] || "";

function normalizeTimestampInput(value: string): string {
  return value.trim().replace(" ", "T");
}

function hasExplicitTimezone(value: string): boolean {
  return /(Z|[+-]\d{2}:?\d{2})$/i.test(value);
}

function hasUTCZuluSuffix(value: string): boolean {
  return /Z$/i.test(value);
}

function isIsoLikeTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:?\d{2})?$/i.test(value);
}

/**
 * Normalize timestamp strings from API to be interpreted consistently
 * in application timezone.
 */
export function normalizeApiTimestampString(value: string): string {
  const normalized = normalizeTimestampInput(value);
  if (!normalized || !isIsoLikeTimestamp(normalized)) {
    return value;
  }

  if (hasUTCZuluSuffix(normalized)) {
    // Backend historically sends WIB wall-clock with Z suffix.
    // Treat this as app timezone wall-clock to avoid -7h drift.
    if (APP_TIMEZONE_OFFSET) {
      return `${normalized.replace(/Z$/i, "")}${APP_TIMEZONE_OFFSET}`;
    }
    return normalized.replace(/Z$/i, "");
  }

  if (!hasExplicitTimezone(normalized) && APP_TIMEZONE_OFFSET) {
    return `${normalized}${APP_TIMEZONE_OFFSET}`;
  }

  return normalized;
}

/**
 * Parse a date string from API consistently.
 * - If timestamp already has timezone info, parse as-is.
 * - If timestamp is naive, interpret it using app timezone offset when known.
 */
export function parseApiDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }

  const normalized = normalizeApiTimestampString(date);
  if (!normalized) {
    return new Date(NaN);
  }
  return new Date(normalized);
}


/**
 * Format a date to Indonesian long format (e.g., "15 Desember 2024").
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: APP_TIMEZONE,
  }).format(parseApiDate(date));
}

/**
 * Format a date to Indonesian short format with time (e.g., "15 Des 2024, 14:30").
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIMEZONE,
  }).format(parseApiDate(date));
}

/**
 * Format a date to relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = parseApiDate(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;

  return formatDate(date);
}
