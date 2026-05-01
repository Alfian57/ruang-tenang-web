export function getSafeRedirect(value: string | null | undefined, fallback = "/dashboard") {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://ruang-tenang.local");
    if (parsed.origin !== "https://ruang-tenang.local") {
      return fallback;
    }

    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (normalized === "/login" || normalized.startsWith("/login?") || normalized === "/register" || normalized.startsWith("/register?")) {
      return fallback;
    }

    return normalized;
  } catch {
    return fallback;
  }
}

export function buildPathWithRedirect(path: string, redirect: string | null | undefined) {
  const safeRedirect = getSafeRedirect(redirect, "");
  if (!safeRedirect) return path;

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${new URLSearchParams({ redirect: safeRedirect }).toString()}`;
}
