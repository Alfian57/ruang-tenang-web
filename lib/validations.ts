import { z } from "zod";

// ============================================
// Common Validators
// ============================================

// Email validation with proper format
export const emailSchema = z
  .string()
  .min(1, "Email harus diisi")
  .email("Format email tidak valid")
  .max(255, "Email terlalu panjang");

// Password validation with security requirements
export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(128, "Password terlalu panjang")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung angka");

// Simple password (for login - no strict requirements)
export const loginPasswordSchema = z
  .string()
  .min(1, "Password harus diisi")
  .max(128, "Password terlalu panjang");

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama terlalu panjang")
  .regex(/^[a-zA-Z\s'-]+$/, "Nama hanya boleh mengandung huruf");

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .max(30, "Username terlalu panjang")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username hanya boleh mengandung huruf, angka, - dan _");

// Title validation (for articles, forums)
export const titleSchema = z
  .string()
  .min(5, "Judul minimal 5 karakter")
  .max(200, "Judul terlalu panjang")
  .refine((val) => !/<script|javascript:|on\w+=/i.test(val), "Judul mengandung karakter tidak valid");

// Content validation (for articles, posts)
export const contentSchema = z
  .string()
  .min(10, "Konten minimal 10 karakter")
  .max(50000, "Konten terlalu panjang");

// Short text validation (for descriptions, summaries)
export const shortTextSchema = z
  .string()
  .min(1, "Field ini harus diisi")
  .max(500, "Teks terlalu panjang");

// UUID validation
export const uuidSchema = z
  .string()
  .uuid("ID tidak valid");

// URL validation
export const urlSchema = z
  .string()
  .url("Format URL tidak valid")
  .refine((val) => !val.toLowerCase().startsWith("javascript:"), "URL tidak valid");

// ============================================
// XSS Prevention Helper
// ============================================

const containsXSS = (val: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];
  return xssPatterns.some((pattern) => pattern.test(val));
};

export const safeTextSchema = z
  .string()
  .refine((val) => !containsXSS(val), "Input mengandung karakter tidak valid");

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string().min(1, "Konfirmasi password harus diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    token: z.string().min(1, "Token harus diisi"),
    password: passwordSchema,
    password_confirmation: z.string().min(1, "Konfirmasi password harus diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

export const updatePasswordSchema = z
  .object({
    old_password: loginPasswordSchema,
    new_password: passwordSchema,
    new_password_confirmation: z.string().min(1, "Konfirmasi password harus diisi"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Password tidak cocok",
    path: ["new_password_confirmation"],
  });

export const updateProfileSchema = z.object({
  name: nameSchema,
  bio: z.string().max(500, "Bio terlalu panjang").optional(),
  avatar_url: urlSchema.optional().or(z.literal("")),
});

// ============================================
// Article Schemas
// ============================================

export const createArticleSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  thumbnail_url: urlSchema.optional().or(z.literal("")),
  category_id: uuidSchema,
  is_public: z.boolean().default(false),
});

export const updateArticleSchema = z.object({
  title: titleSchema.optional(),
  content: contentSchema.optional(),
  thumbnail_url: urlSchema.optional().or(z.literal("")),
  category_id: uuidSchema.optional(),
  is_public: z.boolean().optional(),
});

// ============================================
// Forum Schemas
// ============================================

export const createForumSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  category_id: uuidSchema,
});

export const createForumPostSchema = z.object({
  content: z
    .string()
    .min(1, "Balasan tidak boleh kosong")
    .max(10000, "Balasan terlalu panjang")
    .refine((val) => !containsXSS(val), "Input mengandung karakter tidak valid"),
});

// ============================================
// Chat Schemas
// ============================================

export const createChatSessionSchema = z.object({
  title: z.string().max(200, "Judul terlalu panjang").optional(),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Pesan tidak boleh kosong")
    .max(5000, "Pesan terlalu panjang"),
});

// ============================================
// Mood Schemas
// ============================================

export const recordMoodSchema = z.object({
  mood_level: z.number().min(1, "Level mood minimal 1").max(5, "Level mood maksimal 5"),
  note: z.string().max(500, "Catatan terlalu panjang").optional(),
});

// ============================================
// Report Schemas
// ============================================

export const reportReasonOptions = [
  "spam",
  "harassment",
  "hate_speech",
  "violence",
  "misinformation",
  "self_harm",
  "inappropriate",
  "other",
] as const;

export const createReportSchema = z.object({
  reported_id: uuidSchema,
  content_type: z.enum(["user", "article", "forum", "forum_post", "chat_message"]),
  reason: z.enum(reportReasonOptions, {
    errorMap: () => ({ message: "Pilih alasan laporan" }),
  }),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(1000, "Deskripsi terlalu panjang"),
});

// ============================================
// Block User Schema
// ============================================

export const blockUserSchema = z.object({
  blocked_user_id: uuidSchema,
  reason: z.string().max(500, "Alasan terlalu panjang").optional(),
});

// ============================================
// Moderation Schemas
// ============================================

export const moderateArticleSchema = z.object({
  status: z.enum(["approve", "reject", "request_edit"]),
  feedback: z.string().max(2000, "Feedback terlalu panjang").optional(),
  trigger_warnings: z.array(z.string()).optional(),
});

export const handleReportSchema = z.object({
  status: z.enum(["resolved", "dismissed", "escalated"]),
  resolution_notes: z.string().max(2000, "Catatan terlalu panjang").optional(),
  action_taken: z.string().max(1000, "Tindakan terlalu panjang").optional(),
});

// ============================================
// Search Schema
// ============================================

export const searchSchema = z.object({
  q: z
    .string()
    .min(2, "Kata kunci minimal 2 karakter")
    .max(100, "Kata kunci terlalu panjang")
    .refine((val) => !containsXSS(val), "Input mengandung karakter tidak valid"),
  type: z.enum(["all", "articles", "songs"]).optional(),
});

// ============================================
// Pagination Schema
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// ============================================
// Type Exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateForumInput = z.infer<typeof createForumSchema>;
export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type RecordMoodInput = z.infer<typeof recordMoodSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type ModerateArticleInput = z.infer<typeof moderateArticleSchema>;
export type HandleReportInput = z.infer<typeof handleReportSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
