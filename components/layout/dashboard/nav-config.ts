import {
  FileText,
  Users,
  MessageSquare,
  LayoutDashboard,
  Music,
  Trophy,
  Shield,
  Sparkles,
  BookOpen,
  Wind,
  Newspaper,
  Gift,
  Swords,
  Map,
  Gamepad2,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

// Types
export interface NavLink {
  href: string;
  icon: LucideIcon;
  label: string;
  highlight?: boolean;
  secondary?: boolean;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

// Highlighted AI Chat link (rendered separately, outside groups)
export const memberHighlightLink: NavLink = {
  href: ROUTES.CHAT, icon: MessageSquare, label: "Teman Cerita AI", highlight: true,
};

// Member menu items (for regular users) - grouped
export const memberGroups: NavGroup[] = [
  {
    title: "Utama",
    links: [
      { href: ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Beranda" },
    ],
  },
  {
    title: "Aktivitas",
    links: [
      { href: ROUTES.JOURNAL, icon: BookOpen, label: "Jurnal" },
      { href: ROUTES.BREATHING, icon: Wind, label: "Pernafasan" },
    ],
  },
  {
    title: "Fokus Inti",
    links: [
      { href: ROUTES.ARTICLES, icon: Newspaper, label: "Artikel" },
      { href: ROUTES.MUSIC, icon: Music, label: "Musik" },
      { href: ROUTES.FORUM, icon: Users, label: "Forum" },
      { href: ROUTES.PROGRESS_MAP, icon: Map, label: "Peta Perjalanan" },
      { href: ROUTES.REWARDS, icon: Gift, label: "Klaim Hadiah" },
    ],
  },
  {
    title: "Komunitas",
    links: [
      { href: ROUTES.GUILDS, icon: Swords, label: "Guild" },
      { href: ROUTES.DASHBOARD_COMMUNITY, icon: Trophy, label: "Community Stats" },
    ],
  },
  {
    title: "Eksplorasi Opsional",
    links: [
      { href: ROUTES.STORIES, icon: Sparkles, label: "Kisah Inspiratif", secondary: true },
      { href: ROUTES.GAME, icon: Gamepad2, label: "Mini Game", secondary: true },
    ],
  },
];

// Admin menu items (for admin only) - grouped
export const adminGroups: NavGroup[] = [
  {
    title: "Utama",
    links: [
      { href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "Kelola Konten",
    links: [
      { href: ROUTES.ADMIN.USERS, icon: Users, label: "Pengguna" },
      { href: ROUTES.ADMIN.ARTICLES, icon: FileText, label: "Artikel" },
      { href: ROUTES.ADMIN.SONGS, icon: Music, label: "Musik" },
      { href: ROUTES.ADMIN.FORUMS, icon: MessageSquare, label: "Forum" },
      { href: ROUTES.ADMIN.LEVELS, icon: Trophy, label: "Level" },
      { href: ROUTES.ADMIN.REWARDS, icon: Gift, label: "Hadiah" },
      { href: ROUTES.ADMIN.BROADCASTS, icon: Bell, label: "Broadcast" },
    ],
  },
  {
    title: "Moderasi",
    links: [
      { href: ROUTES.ADMIN.MODERATION, icon: Shield, label: "Moderasi" },
    ],
  },
];
