export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  GAMIFICATION: "/gamification",
  HALL_OF_FAME: "/hall-of-fame",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
  PUBLIC_ARTICLES: "/articles",
  PUBLIC_STORIES: "/stories",
  PUBLIC_STORY_CREATE: "/stories/create",
  
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Dashboard - General
  DASHBOARD: "/dashboard",
  DASHBOARD_COMMUNITY: "/dashboard/community",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
  TOPUP: "/dashboard/topup",
  BILLING: "/dashboard/billing",
  
  // Features
  BREATHING: "/dashboard/breathing",
  JOURNAL: "/dashboard/journal",
  MUSIC: "/dashboard/music",
  ARTICLES: "/dashboard/articles",
  ARTICLE_CREATE: "/dashboard/articles/new",
  STORIES: "/dashboard/stories",
  FORUM: "/dashboard/forum",
  FORUM_CREATE: "/dashboard/forum/create",
  CHAT: "/dashboard/chat",
  READING: "/dashboard/reading",
  CONSULTATION: "/dashboard/consultation",
  MOOD_TRACKER: "/dashboard/mood-tracker",
  GUILDS: "/dashboard/guilds",
  PROGRESS_MAP: "/dashboard/progress-map",
  REWARDS: "/dashboard/rewards",
  GAME: "/dashboard/game",

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
    REWARDS: "/dashboard/admin/rewards",
    BROADCASTS: "/dashboard/admin/broadcasts",
  },

  // Mitra
  MITRA: {
    DASHBOARD: "/dashboard/mitra",
    ORGANIZATIONS: "/dashboard/mitra/organizations",
    SUBSCRIPTION: "/dashboard/mitra/subscription",
    INSIGHTS: "/dashboard/mitra/insights",
    PAYMENTS: "/dashboard/mitra/payments",
    SETTINGS: "/dashboard/mitra/settings",
  },

  // Dynamic Builders
  articleDetail: (slug: string) => `/dashboard/articles/${slug}`,
  articleRead: (slug: string) => `/dashboard/articles/read/${slug}`,
  storyDetail: (id: string | number) => `/dashboard/stories/${id}`,
  publicArticleDetail: (slug: string) => `/articles/${slug}`,
  publicStoryDetail: (id: string | number) => `/stories/${id}`,
  forumDetail: (id: string | number) => `/dashboard/forum/${id}`,
  adminForumDetail: (id: string | number) => `/dashboard/admin/forums/${id}`,
  moderationArticle: (id: string | number) => `/dashboard/moderation/queue?focus=${encodeURIComponent(String(id))}`,
  moderationReport: (id: string | number) => `/dashboard/moderation/reports?focus=${encodeURIComponent(String(id))}`,
  guildDetail: (id: string | number) => `/dashboard/guilds/${id}`,
} as const;
