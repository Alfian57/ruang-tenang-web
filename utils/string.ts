/**
 * String manipulation utilities.
 */

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to slug format (lowercase, hyphens).
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build a short excerpt from HTML content.
 */
export function getHtmlExcerpt(
  html: string,
  maxLength: number
): string {
  const plainText = (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) return "";
  if (plainText.length <= maxLength) return plainText;

  return plainText.substring(0, maxLength).trimEnd() + "....";
}
