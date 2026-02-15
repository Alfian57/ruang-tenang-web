/**
 * Date formatting utilities with Indonesian locale.
 *
 * IMPORTANT: The backend sends timestamps from TIMESTAMP WITHOUT TIME ZONE columns.
 * Due to DSN TimeZone=Asia/Jakarta, the stored values are WIB wall-clock times
 * but serialized with a "Z" (UTC) suffix. Use parseApiDate() to strip the "Z"
 * so the browser correctly interprets them as local time.
 */

/**
 * Parse a date string from the API, stripping any trailing "Z" suffix.
 * This prevents double timezone conversion since backend timestamps
 * already represent WIB wall-clock time but are labeled as UTC.
 */
export function parseApiDate(date: string | Date): Date {
  if (typeof date === "string") {
    // Remove trailing Z or timezone offset to treat as local time
    return new Date(date.replace(/Z$/i, ""));
  }
  return date;
}


/**
 * Format a date to Indonesian long format (e.g., "15 Desember 2024").
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
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
  }).format(new Date(date));
}

/**
 * Format a date to relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;

  return formatDate(date);
}
