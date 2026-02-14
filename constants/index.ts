/**
 * App-wide constants.
 *
 * Usage:
 *   import { PAGINATION, ROUTES, STORAGE_KEYS } from "@/constants";
 */

// ============================================
// Pagination Defaults
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// ============================================
// Route Paths
// ============================================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  CHAT: "/dashboard/chat",
  JOURNAL: "/dashboard/journal",
  ARTICLES: "/dashboard/articles",
  MUSIC: "/dashboard/music",
  FORUM: "/dashboard/forum",
  STORIES: "/dashboard/stories",
  BREATHING: "/dashboard/breathing",
  MODERATION: "/dashboard/moderation",
  ADMIN: {
    USERS: "/dashboard/admin/users",
    ARTICLES: "/dashboard/admin/articles",
    SONGS: "/dashboard/admin/songs",
    FORUMS: "/dashboard/admin/forums",
    LEVELS: "/dashboard/admin/levels",
  },
} as const;

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  AUTH: "auth-storage",
} as const;

// ============================================
// Timeouts
// ============================================

export const TIMEOUTS = {
  DEFAULT_REQUEST: 30_000, // 30 seconds
  AI_REQUEST: 60_000, // 60 seconds for AI-powered endpoints
  DEBOUNCE_SEARCH: 300, // 300ms
} as const;

// ============================================
// Roles
// ============================================

export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  MEMBER: "member",
} as const;
