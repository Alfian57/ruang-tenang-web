import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {
    Activity,
    Award,
    BookOpen,
    Brain,
    CalendarCheck,
    Crown,
    FileText,
    Flame,
    Gift,
    Heart,
    LogIn,
    MessageCircle,
    MessageSquare,
    Music2,
    NotebookPen,
    Settings,
    Sprout,
    Target,
    Trophy,
    Zap,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
    activity: Activity,
    achievement: Award,
    article: BookOpen,
    badge: Award,
    brain: Brain,
    chat: MessageCircle,
    community: MessageSquare,
    contribution: Heart,
    content: FileText,
    daily: CalendarCheck,
    feature: Gift,
    flame: Flame,
    forum: MessageSquare,
    gift: Gift,
    journal: NotebookPen,
    level: Trophy,
    login: LogIn,
    mood: Brain,
    music: Music2,
    premium: Crown,
    progress: Activity,
    reward: Gift,
    settings: Settings,
    special: Award,
    sprout: Sprout,
    story: BookOpen,
    streak: Flame,
    target: Target,
    trophy: Trophy,
    xp: Zap,
};

const BADGE_IMAGES: Record<string, string> = {
    streak_7: "/images/badges/streak-7.webp",
    streak_14: "/images/badges/streak-14.webp",
    streak_30: "/images/badges/streak-30.webp",
    streak_60: "/images/badges/streak-60.webp",
    streak_100: "/images/badges/streak-100.webp",
    activities_10: "/images/badges/activities-10.webp",
    activities_50: "/images/badges/activities-50.webp",
    activities_100: "/images/badges/activities-100.webp",
    activities_500: "/images/badges/activities-500.webp",
    first_article: "/images/badges/first-article.webp",
    articles_5: "/images/badges/articles-5.webp",
    helpful_commenter: "/images/badges/helpful-commenter.webp",
    top_contributor: "/images/badges/top-contributor.webp",
    level_5: "/images/badges/level-5.webp",
    level_10: "/images/badges/level-10.webp",
    xp_1000: "/images/badges/xp-1000.webp",
    xp_5000: "/images/badges/xp-5000.webp",
    xp_10000: "/images/badges/xp-10000.webp",
    beta_tester: "/images/badges/beta-tester.webp",
    community_mentor: "/images/badges/community-mentor.webp",
    guardian: "/images/badges/guardian.webp",
    first_story: "/images/badges/first-story.webp",
    stories_3: "/images/badges/stories-3.webp",
    story_100_hearts: "/images/badges/story-100-hearts.webp",
};

function normalize(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function resolveIcon(value: string | undefined, fallback: LucideIcon): LucideIcon {
    if (!value) return fallback;

    const normalized = normalize(value);
    const directMatch = ICONS[normalized];
    if (directMatch) return directMatch;

    const matchers: Array<[string[], LucideIcon]> = [
        [["streak", "flame", "fire"], Flame],
        [["xp", "energy", "boost"], Zap],
        [["level", "badge", "achievement", "milestone"], Award],
        [["article", "book", "read", "content"], BookOpen],
        [["journal", "write", "reflection"], NotebookPen],
        [["chat", "message", "conversation"], MessageCircle],
        [["forum", "community", "comment"], MessageSquare],
        [["mood", "wellness", "mental"], Brain],
        [["story", "inspire"], BookOpen],
        [["premium", "crown"], Crown],
        [["reward", "gift", "unlock"], Gift],
        [["target", "goal", "mission"], Target],
        [["login", "sign in"], LogIn],
    ];

    const matched = matchers.find(([keywords]) => keywords.some((keyword) => normalized.includes(keyword)));
    return matched?.[1] ?? fallback;
}

interface GamificationIconProps {
    name?: string;
    fallback?: LucideIcon;
    className?: string;
    strokeWidth?: number;
}

export function GamificationIcon({
    name,
    fallback = Award,
    className,
    strokeWidth = 2,
}: GamificationIconProps) {
    const badgeImage = name ? BADGE_IMAGES[name.trim().toLowerCase()] : undefined;
    if (badgeImage) {
        return (
            <Image
                src={badgeImage}
                alt=""
                aria-hidden="true"
                width={64}
                height={64}
                sizes="64px"
                className={className}
            />
        );
    }

    const Icon = resolveIcon(name, fallback);
    return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
