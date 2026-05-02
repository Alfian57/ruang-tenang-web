import {
  Bell,
  FileText,
  Music,
  Search as SearchIcon,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import type { UserRole } from "@/types";
import {
  adminGroups,
  memberGroups,
  memberHighlightLink,
  mitraGroups,
  mitraHighlightLink,
  type NavGroup,
  type NavLink,
} from "./nav-config";

export interface DashboardSearchEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  section: string;
  keywords: string[];
}

interface DashboardQueryAction {
  id: string;
  title: (query: string) => string;
  description: string;
  href: (query: string) => string;
  icon: LucideIcon;
  keywords: string[];
}

const SEARCH_RESULT_LIMIT = 6;

const ROLE_PLACEHOLDERS: Record<UserRole, string> = {
  user: "Cari artikel, musik, atau menu...",
  admin: "Cari menu admin...",
  mitra: "Cari menu mitra...",
};

const ROLE_EMPTY_HINTS: Record<UserRole, string> = {
  user: "Coba kata kunci lain atau buka menu Artikel dan Musik.",
  admin: "Pencarian admin hanya menampilkan area manajemen yang tersedia untuk admin.",
  mitra: "Pencarian mitra hanya menampilkan area operasional mitra.",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function withSearchParam(href: string, query: string): string {
  const [path, rawQuery = ""] = href.split("?");
  const searchParams = new URLSearchParams(rawQuery);
  searchParams.set("search", query.trim());
  const nextQuery = searchParams.toString();
  return nextQuery ? `${path}?${nextQuery}` : path;
}

function routeKeywords(link: NavLink, groupTitle: string): string[] {
  return [
    link.label,
    groupTitle,
    link.href,
    ...link.href.split("/").filter(Boolean),
  ];
}

function fromNavGroups(groups: NavGroup[], extras: Array<{ link: NavLink; section: string }> = []): DashboardSearchEntry[] {
  const groupEntries = groups.flatMap((group) =>
    group.links.map((link) => ({
      id: link.href,
      title: link.label,
      description: group.title,
      href: link.href,
      icon: link.icon,
      section: group.title,
      keywords: routeKeywords(link, group.title),
    }))
  );

  const extraEntries = extras.map(({ link, section }) => ({
    id: link.href,
    title: link.label,
    description: section,
    href: link.href,
    icon: link.icon,
    section,
    keywords: routeKeywords(link, section),
  }));

  return [...extraEntries, ...groupEntries].filter((entry, index, entries) =>
    entries.findIndex((candidate) => candidate.href === entry.href) === index
  );
}

const ADMIN_QUERY_ACTIONS: DashboardQueryAction[] = [
  {
    id: "admin-users-query",
    title: (query) => `Cari pengguna: ${query}`,
    description: "Buka manajemen pengguna dengan filter pencarian.",
    href: (query) => withSearchParam(ROUTES.ADMIN.USERS, query),
    icon: Users,
    keywords: ["pengguna", "user", "akun", "email", "role", "admin"],
  },
  {
    id: "admin-articles-query",
    title: (query) => `Cari artikel admin: ${query}`,
    description: "Buka manajemen artikel dengan filter pencarian.",
    href: (query) => withSearchParam(ROUTES.ADMIN.ARTICLES, query),
    icon: FileText,
    keywords: ["artikel", "konten", "kategori", "moderasi"],
  },
  {
    id: "admin-songs-query",
    title: (query) => `Cari musik admin: ${query}`,
    description: "Buka manajemen musik dengan filter pencarian.",
    href: (query) => withSearchParam(ROUTES.ADMIN.SONGS, query),
    icon: Music,
    keywords: ["musik", "lagu", "audio", "kategori"],
  },
  {
    id: "admin-forums-query",
    title: (query) => `Cari forum admin: ${query}`,
    description: "Buka manajemen forum dengan filter pencarian.",
    href: (query) => withSearchParam(ROUTES.ADMIN.FORUMS, query),
    icon: SearchIcon,
    keywords: ["forum", "diskusi", "topik", "komunitas"],
  },
  {
    id: "admin-broadcasts-query",
    title: (query) => `Cari broadcast: ${query}`,
    description: "Buka manajemen broadcast dengan filter pencarian.",
    href: (query) => withSearchParam(ROUTES.ADMIN.BROADCASTS, query),
    icon: Bell,
    keywords: ["broadcast", "notifikasi", "pengumuman"],
  },
];

function entryMatches(entry: DashboardSearchEntry, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const searchable = normalizeText([
    entry.title,
    entry.description,
    ...entry.keywords,
  ].join(" "));

  return terms.every((term) => searchable.includes(term));
}

function actionMatches(action: DashboardQueryAction, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;

  const searchable = normalizeText(action.keywords.join(" "));
  return searchable.includes(normalizedQuery) || normalizedQuery.length >= 2;
}

function getRoleEntries(role: UserRole): DashboardSearchEntry[] {
  if (role === "admin") {
    return fromNavGroups(adminGroups);
  }

  if (role === "mitra") {
    return fromNavGroups(mitraGroups, [{ link: mitraHighlightLink, section: "Utama" }]);
  }

  return fromNavGroups(memberGroups, [{ link: memberHighlightLink, section: "Utama" }]);
}

export function getDashboardSearchEntries(role: UserRole, query: string, limit = SEARCH_RESULT_LIMIT): DashboardSearchEntry[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const roleEntries = getRoleEntries(role)
    .filter((entry) => entryMatches(entry, normalizedQuery))
    .slice(0, limit);

  if (role !== "admin") {
    return roleEntries;
  }

  const queryActions = ADMIN_QUERY_ACTIONS
    .filter((action) => actionMatches(action, normalizedQuery))
    .map((action) => ({
      id: action.id,
      title: action.title(query.trim()),
      description: action.description,
      href: action.href(query),
      icon: action.icon,
      section: "Aksi pencarian",
      keywords: action.keywords,
    }));

  return [...queryActions, ...roleEntries].slice(0, limit);
}

export function getGlobalSearchPlaceholder(role?: UserRole | null): string {
  return role ? ROLE_PLACEHOLDERS[role] : "Cari...";
}

export function getGlobalSearchEmptyHint(role?: UserRole | null): string {
  return role ? ROLE_EMPTY_HINTS[role] : "Coba kata kunci lain.";
}
