const FORUM_FORMAT_TAG_REGEX = /^\s*\[Format:\s*([^\]]+)\]\s*/i;

export function extractForumFormatLabel(content?: string | null): string | null {
  if (!content) return null;

  const match = content.match(FORUM_FORMAT_TAG_REGEX);
  return match?.[1]?.trim() || null;
}

export function stripForumFormatTag(content?: string | null): string {
  if (!content) return "";

  return content.replace(FORUM_FORMAT_TAG_REGEX, "").trimStart();
}