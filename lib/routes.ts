export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Dashboard - General
  DASHBOARD: "/dashboard",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
  
  // Features
  BREATHING: "/dashboard/breathing",
  JOURNAL: "/dashboard/journal",
  MUSIC: "/dashboard/music",
  ARTICLES: "/dashboard/articles",
  ARTICLE_CREATE: "/dashboard/articles/new",
  STORIES: "/dashboard/stories",
  FORUM: "/dashboard/forum",
  CHAT: "/dashboard/chat",
  READING: "/dashboard/reading",
  CONSULTATION: "/dashboard/consultation",
  MOOD_TRACKER: "/dashboard/mood-tracker",
  COMMUNITY: "/community",

  // Admin
  ADMIN: {
    DASHBOARD: "/dashboard/admin",
    USERS: "/dashboard/admin/users",
    ARTICLES: "/dashboard/admin/articles",
    SONGS: "/dashboard/admin/songs",
    FORUMS: "/dashboard/admin/forums",
    LEVELS: "/dashboard/admin/levels",
    MODERATION: "/dashboard/moderation",
    MODERATION_REPORTS: "/dashboard/moderation/reports",
    MODERATION_QUEUE: "/dashboard/moderation/queue",
  },

  // Dynamic Builders
  articleDetail: (slug: string) => `/dashboard/articles/${slug}`,
  articleRead: (slug: string) => `/dashboard/articles/read/${slug}`,
  storyDetail: (id: string | number) => `/dashboard/stories/${id}`,
  forumDetail: (id: string | number) => `/dashboard/forum/${id}`,
  adminForumDetail: (id: string | number) => `/dashboard/admin/forums/${id}`,
  moderationArticle: (id: string | number) => `/dashboard/moderation/articles/${id}`,
  moderationReport: (id: string | number) => `/dashboard/moderation/reports/${id}`,
} as const;
