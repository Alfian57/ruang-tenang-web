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
  COMMUNITY: "/dashboard/community",
  JOURNEY: "/dashboard/journey",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
  BILLING: "/dashboard/billing",
  
  // Features
  JOURNAL: "/dashboard/journal",
  MUSIC: "/dashboard/music",
  ARTICLES: "/dashboard/articles",
  ARTICLE_CREATE: "/dashboard/articles/new",
  CHAT: "/dashboard/chat",
  CONSULTATION: "/dashboard/consultation",
  MOOD_TRACKER: "/dashboard/mood-tracker",
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
    MODERATION_STORIES: "/dashboard/moderation/stories",
    MODERATION_APPEALS: "/dashboard/moderation/appeals",
    MODERATION_CRISIS_KEYWORDS: "/dashboard/moderation/crisis-keywords",
    MODERATION_ACTIONS: "/dashboard/moderation/actions",
    MODERATION_TRIGGER_WARNINGS: "/dashboard/moderation/trigger-warnings",
    REWARDS: "/dashboard/admin/rewards",
    BROADCASTS: "/dashboard/admin/broadcasts",
    BILLING: "/dashboard/admin/billing",
    B2B: "/dashboard/admin/b2b",
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
  communityTab: (tab: "forum" | "stories" | "journals" | "stats") =>
    tab === "forum" ? "/dashboard/community" : `/dashboard/community?tab=${tab}`,
  communityForum: (slug: string | number) => `/dashboard/community/forum/${slug}`,
  communityStory: (id: string | number) => `/dashboard/community/stories/${id}`,
  COMMUNITY_STORY_CREATE: "/dashboard/community/stories/new",
  journeyTab: (tab: "summary" | "map" | "rewards") =>
    tab === "summary" ? "/dashboard/journey" : `/dashboard/journey?tab=${tab}`,
  billingTab: (tab: "packages" | "coins" | "transactions") =>
    tab === "packages" ? "/dashboard/billing" : `/dashboard/billing?tab=${tab}`,
  publicArticleDetail: (slug: string) => `/articles/${slug}`,
  publicStoryDetail: (id: string | number) => `/stories/${id}`,
  adminForumDetail: (id: string | number) => `/dashboard/admin/forums/${id}`,
  moderationArticle: (id: string | number) => `/dashboard/moderation/queue?focus=${encodeURIComponent(String(id))}`,
  moderationReport: (id: string | number) => `/dashboard/moderation/reports?focus=${encodeURIComponent(String(id))}`,
} as const;
