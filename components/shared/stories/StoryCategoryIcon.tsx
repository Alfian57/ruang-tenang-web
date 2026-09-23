import type { LucideIcon } from "lucide-react";
import {
    BookHeart,
    FileText,
    Flower2,
    HeartHandshake,
    Hospital,
    Sprout,
    Sparkles,
    Sun,
    Wind,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    "anxiety-management": Wind,
    "finding-hope": Sparkles,
    "healing-from-trauma": HeartHandshake,
    "other": FileText,
    "overcoming-depression": Sun,
    "professional-help": Hospital,
    "recovery-journey": Sprout,
    "self-care-journey": Flower2,
};

function normalize(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

interface StoryCategoryIconProps {
    slug?: string;
    name?: string;
    className?: string;
}

export function StoryCategoryIcon({ slug, name, className = "h-4 w-4" }: StoryCategoryIconProps) {
    const Icon = CATEGORY_ICONS[normalize(slug || "")] || CATEGORY_ICONS[normalize(name || "")] || BookHeart;
    return <Icon className={className} aria-hidden="true" />;
}
