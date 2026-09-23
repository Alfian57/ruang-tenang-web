/**
 * Utility modules index - re-exports all utilities for convenient imports.
 *
 * Usage:
 *   import { formatDate, truncate, getMoodLabel } from "@/utils";
 *   OR
 *   import { formatDate } from "@/utils/date";
 */

// Styling utilities (shadcn standard)
export { cn } from "@/lib/cn";

// Date formatting
export { formatDate, formatDateTime, formatRelativeTime } from "./date";

// String manipulation
export { truncate, capitalize, slugify, getHtmlExcerpt } from "./string";

// Mood helpers
export { getMoodLabel, getMoodColor, getAllMoods } from "./mood";
