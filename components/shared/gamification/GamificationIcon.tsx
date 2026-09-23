import type { LucideIcon } from "lucide-react";
import {
    Activity,
    Award,
    BookOpen,
    Brain,
    CalendarCheck,
    Compass,
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
    Sparkles,
    Sprout,
    Target,
    Trophy,
    UserRound,
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
    special: Sparkles,
    sprout: Sprout,
    story: BookOpen,
    streak: Flame,
    target: Target,
    trophy: Trophy,
    xp: Zap,
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
    fallback = Sparkles,
    className,
    strokeWidth = 2,
}: GamificationIconProps) {
    const Icon = resolveIcon(name, fallback);
    return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
