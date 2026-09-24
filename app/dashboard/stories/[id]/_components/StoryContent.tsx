import Image from "next/image";
import {
  BookOpen,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  BadgeCheck,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { InspiringStory } from "@/types/gamification";
import { StoryCategoryIcon } from "@/components/shared/stories/StoryCategoryIcon";

interface StoryContentProps {
  story: InspiringStory;
  heartLoading: boolean;
  onToggleHeart: () => void;
}

export function StoryContent({ story, heartLoading, onToggleHeart }: StoryContentProps) {
  const hasCover = Boolean(story.cover_image);

  return (
    <div className="space-y-6">
      {hasCover && (
        <div className="relative aspect-[16/8] max-h-[440px] overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-slate-100 shadow-sm">
          <Image
            src={story.cover_image}
            alt={story.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1024px"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
        </div>
      )}

      <header className="theme-story-bg theme-story-border relative isolate overflow-hidden rounded-[1.75rem] border p-5 shadow-sm sm:p-8 md:p-10">
        <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/55 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-rose-100/50 blur-3xl" />

        <div className={cn("relative z-10", !hasCover && "sm:max-w-[calc(100%-9rem)] md:max-w-[calc(100%-12rem)]")}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full border-white/80 bg-white/75 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-theme-story-heading shadow-sm">
              <BookOpen className="h-3.5 w-3.5" /> Kisah komunitas
            </Badge>
            {story.is_featured && (
              <Badge className="gap-1 rounded-full border border-amber-200 bg-amber-50 text-amber-800 shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5" /> Kisah pilihan
              </Badge>
            )}
          </div>

          <h1 className="mb-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-white/80 text-theme-story-icon shadow-sm">
                {story.is_anonymous ? (
                  <User className="h-4 w-4" />
                ) : story.author?.avatar ? (
                  <Image src={story.author.avatar} alt={story.author.name} width={40} height={40} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{story.author?.name?.trim().charAt(0).toLocaleUpperCase() || <User className="h-4 w-4" />}</span>
                )}
              </span>
              <span className="truncate font-semibold text-slate-800">
                {story.is_anonymous ? "Anonim" : story.author?.name || "Anggota Ruang Tenang"}
              </span>
            </div>
            {story.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                {format(new Date(story.published_at), "d MMMM yyyy", { locale: idLocale })}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-slate-400" />
              {story.view_count} views
            </span>
          </div>

          {(story.categories?.length > 0 || story.tags?.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {story.categories?.map((category) => (
                <Badge key={category.id} variant="secondary" className="gap-1.5 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-slate-700 shadow-sm">
                  <StoryCategoryIcon slug={category.slug} name={category.name} className="h-4 w-4" />
                  {category.name}
                </Badge>
              ))}
              {story.tags?.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="outline" className="gap-1.5 rounded-full border-white/80 bg-white/50 px-3 py-1.5 text-slate-600">
                  <Tag className="h-3 w-3" /> {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {!hasCover && (
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-7 -right-2 hidden h-48 w-32 opacity-95 sm:block md:-bottom-9 md:right-5 md:h-64 md:w-40">
            <Image
              src="/images/landing/mascot/community.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 128px, 160px"
              className="object-contain object-bottom"
            />
          </div>
        )}
      </header>

      <article className="rounded-[1.75rem] border border-slate-200/80 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10 lg:px-12">
        <div
          className="prose prose-slate mx-auto mb-0 max-w-3xl text-[15px] leading-8 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 prose-blockquote:rounded-r-xl prose-blockquote:border-primary/40 prose-blockquote:bg-rose-50/60 prose-blockquote:py-1 prose-img:rounded-2xl sm:text-base"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.content) }}
        />
      </article>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <Button
          variant={story.has_hearted ? "default" : "outline"}
          onClick={onToggleHeart}
          disabled={heartLoading}
          className={cn(
            "h-11 gap-2 rounded-xl px-4",
            story.has_hearted && "bg-primary hover:bg-primary"
          )}
        >
          <Heart className={cn("h-4 w-4", story.has_hearted && "fill-current")} />
          {story.heart_count} Apresiasi
        </Button>
        <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-50 px-4 text-sm font-medium text-slate-600" aria-label={`${story.comment_count} komentar`}>
          <MessageCircle className="h-4 w-4 text-slate-500" />
          {story.comment_count} Komentar
        </div>
      </div>
    </div>
  );
}
