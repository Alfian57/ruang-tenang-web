/**
 * Utility modules index - re-exports all utilities for convenient imports.
 *
 * Usage:
 *   import { formatDate, truncate, getMoodEmoji } from "@/lib/utils";
 *   OR
 *   import { formatDate } from "@/lib/utils/date";
 */

// Styling utilities (shadcn standard)
export { cn } from "./cn";

// Date formatting
export { formatDate, formatDateTime, formatRelativeTime } from "./date";

// String manipulation
export { truncate, capitalize, slugify } from "./string";

// Mood helpers
export { getMoodEmoji, getMoodLabel, getMoodColor, getAllMoods } from "./mood";
